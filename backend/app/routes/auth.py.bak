from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..models.auth import LoginRequest, Token, LogoutRequest
from ..models.client import ClientCreate, ClientResponse
from ..services.auth import AuthService
from ..database.supabase import supabase

security = HTTPBearer()
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=ClientResponse)
async def signup(client: ClientCreate):
    return await AuthService.create_user(client)

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    return await AuthService.login_user(credentials)

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Security(security)):
    return await AuthService.logout_user(credentials.credentials) 