from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from ..models.auth import LoginRequest, Token, PasswordResetRequest, PasswordReset
from ..models.client import ClientCreate
from ..database.supabase import supabase
from ..utils.security import verify_password, create_access_token, get_password_hash
from ..utils.email import send_password_reset_email
from datetime import datetime, timedelta
from ..config.settings import settings
import re
import logging
import uuid

# Set up logging with colors
class PurpleDebugFormatter(logging.Formatter):
    def format(self, record):
        if record.levelno == logging.DEBUG:
            record.msg = f"\033[95m{record.msg}\033[0m"  # Light purple
        return super().format(record)

# Configure logging
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(PurpleDebugFormatter('%(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class AuthService:
    @staticmethod
    async def create_user(client: ClientCreate):
        logger.debug("\n=== Starting create_user process ===")
        logger.debug(f"Received client data: {client.dict()}")
        
        try:
            # Simple email validation
            if '@' not in client.email or '.' not in client.email:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid email format. Email must contain '@' and '.'"
                )
            
            # Create client record
            logger.debug("\nCreating client record...")
            current_time = datetime.utcnow()
            client_data = {
                "client_name": client.client_name,
                "email": client.email,
                "created_at": current_time.isoformat()
            }
            logger.debug(f"Client data being inserted: {client_data}")
            
            # Insert client and get the ID
            client_result = supabase.table("Clients").insert(client_data).execute()
            logger.debug(f"Client record creation response: {client_result}")
            
            if not client_result.data:
                raise HTTPException(status_code=400, detail="Failed to create client record")
            
            client_id = client_result.data[0]['id']
            logger.debug(f"Client record created with ID: {client_id}")
            
            # Create authentication record with hashed password
            logger.debug("\nCreating authentication record...")
            auth_data = {
                "password_hash": get_password_hash(client.password),
                "created_at": current_time.isoformat(),
                "client_id": client_id
            }
            logger.debug("Auth data being inserted (password hash hidden)")
            
            auth_result = supabase.table("Authentication").insert(auth_data).execute()
            logger.debug(f"Auth record creation response: {auth_result}")
            
            if not auth_result.data:
                # If auth creation fails, we should clean up the client record
                supabase.table("Clients").delete().eq("id", client_id).execute()
                raise HTTPException(status_code=400, detail="Failed to create authentication record")
            
            logger.debug("\n=== User creation successful ===")
            return client_result.data[0]
            
        except Exception as e:
            logger.debug("\n=== Error occurred ===")
            logger.debug(f"Error type: {type(e)}")
            logger.debug(f"Error message: {str(e)}")
            logger.debug(f"Error args: {e.args}")
            if hasattr(e, '__dict__'):
                logger.debug(f"Error details: {e.__dict__}")
            
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create user: {str(e)}"
            )

    @staticmethod
    async def login_user(credentials: LoginRequest):
        print("\n=== Starting login process ===")
        print(f"Attempting login for email: {credentials.email}")
        
        try:
            # First, get the client by email
            client_result = supabase.table("Clients").select("*").eq("email", credentials.email).execute()
            if not client_result.data:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            client = client_result.data[0]
            print(f"Found client with ID: {client['id']}")
            
            # Get the authentication record
            auth_result = supabase.table("Authentication").select("*").eq("client_id", client['id']).execute()
            if not auth_result.data:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            auth = auth_result.data[0]
            print("Found authentication record")
            print(f"Debug - Authentication record: {auth}")
            print(f"Debug - Attempting to verify password: '{credentials.password}'")
            
            # Verify the password
            password_verified = verify_password(credentials.password, auth['password_hash'])
            print(f"Debug - Password verification result: {password_verified}")
            
            if not password_verified:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Update last login time
            current_time = datetime.utcnow()
            supabase.table("Authentication").update({
                "last_login": current_time.isoformat()
            }).eq("auth_id", auth['auth_id']).execute()
            
            # Create a session
            session_data = {
                "session_id": create_access_token({"sub": str(client['id'])}),
                "client_id": client['id'],
                "created_at": current_time.isoformat(),
                "expires_at": (current_time + timedelta(days=1)).isoformat()
            }
            
            session_result = supabase.table("Sessions").insert(session_data).execute()
            print(f"Session created: {session_result.data}")
            
            return Token(
                access_token=session_data["session_id"],
                token_type="bearer"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Login error: {str(e)}")
            print(f"Debug - Error type: {type(e)}")
            print(f"Debug - Error args: {e.args}")
            raise HTTPException(status_code=401, detail="Invalid email or password")

    @staticmethod
    async def get_current_user(token: str = Depends(oauth2_scheme)):
        try:
            user = supabase.auth.get_user(token)
            return user
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")

    @staticmethod
    async def get_current_token(token: str = Depends(oauth2_scheme)):
        return token

    @staticmethod
    async def logout_user(token: str):
        try:
            supabase.auth.sign_out()
            return {"message": "Successfully logged out"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def request_password_reset(reset_request: PasswordResetRequest):
        """
        Request a password reset by sending an email with a reset token
        
        Args:
            reset_request: The password reset request containing the email
            
        Returns:
            dict: A message indicating the email was sent
            
        Raises:
            HTTPException: If the email is not found
        """
        logger.debug("\n=== Starting password reset request process ===")
        logger.debug(f"Received email: {reset_request.email}")
        
        try:
            # Check if client exists with this email
            client_result = supabase.table("Clients").select("*").eq("email", reset_request.email).execute()
            
            if not client_result.data:
                # For security reasons, don't reveal that the email doesn't exist
                # Just return success as if we sent an email
                logger.debug(f"Email not found: {reset_request.email}")
                return {"message": "If your email is registered, you will receive a password reset link"}
            
            client = client_result.data[0]
            client_id = client['id']
            logger.debug(f"Found client with ID: {client_id}")
            
            # Generate a unique reset token
            reset_token = str(uuid.uuid4())
            
            # Store the reset token with expiration time
            current_time = datetime.utcnow()
            expiration_time = current_time + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
            
            # Check if there's an existing token and delete it
            existing_token = supabase.table("ResetTokens").select("*").eq("client_id", client_id).execute()
            if existing_token.data:
                logger.debug(f"Deleting existing reset token for client: {client_id}")
                supabase.table("ResetTokens").delete().eq("client_id", client_id).execute()
            
            # Insert new token
            reset_token_data = {
                "token": reset_token,
                "client_id": client_id,
                "created_at": current_time.isoformat(),
                "expires_at": expiration_time.isoformat()
            }
            
            token_result = supabase.table("ResetTokens").insert(reset_token_data).execute()
            logger.debug(f"Reset token created: {token_result.data}")
            
            # Send reset email
            email_sent = await send_password_reset_email(reset_request.email, reset_token)
            logger.debug(f"Reset email sent: {email_sent}")
            
            return {"message": "If your email is registered, you will receive a password reset link"}
            
        except Exception as e:
            logger.debug(f"Password reset request error: {str(e)}")
            logger.debug(f"Debug - Error type: {type(e)}")
            logger.debug(f"Debug - Error args: {e.args}")
            # For security, return the same message as success
            return {"message": "If your email is registered, you will receive a password reset link"}
    
    @staticmethod
    async def verify_reset_token(token: str):
        """
        Verify if a password reset token is valid
        
        Args:
            token: The password reset token
            
        Returns:
            dict: The client ID associated with the token
            
        Raises:
            HTTPException: If the token is invalid or expired
        """
        logger.debug("\n=== Verifying password reset token ===")
        logger.debug(f"Token: {token}")
        
        try:
            # Get the token from the database
            token_result = supabase.table("ResetTokens").select("*").eq("token", token).execute()
            
            if not token_result.data:
                logger.debug("Token not found")
                raise HTTPException(status_code=400, detail="Invalid or expired token")
            
            reset_token = token_result.data[0]
            expires_at = datetime.fromisoformat(reset_token['expires_at'])
            
            # Check if token is expired
            if datetime.utcnow() > expires_at:
                logger.debug("Token has expired")
                # Delete the expired token
                supabase.table("ResetTokens").delete().eq("token", token).execute()
                raise HTTPException(status_code=400, detail="Invalid or expired token")
            
            return {"client_id": reset_token['client_id']}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.debug(f"Token verification error: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    @staticmethod
    async def reset_password(reset_data: PasswordReset):
        """
        Reset a password using a valid token
        
        Args:
            reset_data: The password reset data containing the token and new password
            
        Returns:
            dict: A success message
            
        Raises:
            HTTPException: If the token is invalid or the password reset fails
        """
        logger.debug("\n=== Resetting password ===")
        
        try:
            # Verify the token first
            verification = await AuthService.verify_reset_token(reset_data.token)
            client_id = verification["client_id"]
            
            # Get the authentication record
            auth_result = supabase.table("Authentication").select("*").eq("client_id", client_id).execute()
            
            if not auth_result.data:
                raise HTTPException(status_code=400, detail="Authentication record not found")
            
            auth_id = auth_result.data[0]['auth_id']
            
            # Update the password
            password_hash = get_password_hash(reset_data.new_password)
            update_result = supabase.table("Authentication").update({
                "password_hash": password_hash,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("auth_id", auth_id).execute()
            
            if not update_result.data:
                raise HTTPException(status_code=400, detail="Failed to update password")
            
            # Delete the used token
            supabase.table("ResetTokens").delete().eq("token", reset_data.token).execute()
            
            logger.debug("Password reset successful")
            return {"message": "Password has been reset successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.debug(f"Password reset error: {str(e)}")
            raise HTTPException(status_code=400, detail="Failed to reset password") 
