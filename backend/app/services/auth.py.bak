from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from ..models.auth import LoginRequest, Token
from ..models.client import ClientCreate
from ..database.supabase import supabase
from ..utils.security import verify_password, create_access_token, get_password_hash
from datetime import datetime, timedelta
import re
import logging

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
            
            # Verify the password
            if not verify_password(credentials.password, auth['password_hash']):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Update last login time
            current_time = datetime.utcnow()
            supabase.table("Authentication").update({
                "last_login": current_time.isoformat()
            }).eq("auth_id", auth['auth_id']).execute()
            
            # Create a session
            session_data = {
                "ssesion_id": create_access_token({"sub": str(client['id'])}),
                "client_id": client['id'],
                "created_at": current_time.isoformat(),
                "expires_at": (current_time + timedelta(days=1)).isoformat()
            }
            
            session_result = supabase.table("Sessions").insert(session_data).execute()
            print(f"Session created: {session_result.data}")
            
            return Token(
                access_token=session_data["ssesion_id"],
                token_type="bearer"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"Login error: {str(e)}")
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