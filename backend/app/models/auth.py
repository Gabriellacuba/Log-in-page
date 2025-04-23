from pydantic import BaseModel
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: str
    password: str

class LogoutRequest(BaseModel):
    token: str

class SessionCreate(BaseModel):
    client_id: int
    expires_at: datetime

# New models for forgot password functionality
class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetTokenVerify(BaseModel):
    token: str

class PasswordReset(BaseModel):
    token: str
    new_password: str 