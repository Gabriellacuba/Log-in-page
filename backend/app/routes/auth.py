"""
Authentication Routes
--------------------

This module defines the authentication-related API endpoints:
- User signup (registration)
- User login (authentication)
- User logout (token invalidation)
- Password reset request
- Password reset verification
- Password reset execution

All authentication is handled via JWT tokens that are verified on
protected endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..models.auth import LoginRequest, Token, LogoutRequest, PasswordResetRequest, PasswordResetTokenVerify, PasswordReset
from ..models.client import ClientCreate, ClientResponse
from ..services.auth import AuthService
from ..database.supabase import supabase

security = HTTPBearer()
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=ClientResponse)
async def signup(client: ClientCreate):
    """
    Register a new client
    
    Takes client registration information (name, email, password)
    and creates a new client record in the database.
    
    Returns:
        ClientResponse: The created client data (excluding password)
    """
    return await AuthService.create_user(client)

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    """
    Authenticate a client
    
    Verifies client credentials and issues a JWT token upon successful authentication.
    
    Returns:
        Token: JWT access token for the authenticated client
    """
    return await AuthService.login_user(credentials)

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Logout a client
    
    Invalidates the provided JWT token.
    
    Args:
        credentials: The JWT token to invalidate
        
    Returns:
        dict: Success message
    """
    return await AuthService.logout_user(credentials.credentials)

@router.post("/forgot-password")
async def forgot_password(reset_request: PasswordResetRequest):
    """
    Request a password reset
    
    Sends a password reset email to the user with a token
    that can be used to reset their password.
    
    Args:
        reset_request: The password reset request containing the email
        
    Returns:
        dict: A message indicating the email was sent
    """
    return await AuthService.request_password_reset(reset_request)

@router.post("/verify-reset-token")
async def verify_reset_token(token_data: PasswordResetTokenVerify):
    """
    Verify a password reset token
    
    Checks if a token is valid and not expired.
    
    Args:
        token_data: The token verification request
        
    Returns:
        dict: The client ID associated with the token
    """
    return await AuthService.verify_reset_token(token_data.token)

@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset):
    """
    Reset a password
    
    Resets a user's password using a valid reset token.
    
    Args:
        reset_data: The password reset data containing the token and new password
        
    Returns:
        dict: A success message
    """
    return await AuthService.reset_password(reset_data) 