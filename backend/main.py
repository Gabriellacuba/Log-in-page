from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr
import jwt
from passlib.context import CryptContext
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Client Authentication API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class ClientBase(BaseModel):
    name: str
    email: EmailStr

class ClientCreate(ClientBase):
    password: str

class Client(ClientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_client(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.JWTError:
        raise credentials_exception
    
    client = supabase.table("clients").select("*").eq("email", token_data.email).execute()
    if not client.data:
        raise credentials_exception
    return client.data[0]

# Authentication endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    client = supabase.table("clients").select("*").eq("email", form_data.username).execute()
    if not client.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    client_data = client.data[0]
    auth_data = supabase.table("authentication").select("*").eq("client_id", client_data["id"]).execute()
    
    if not auth_data.data or not verify_password(form_data.password, auth_data.data[0]["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": client_data["email"]}, expires_delta=access_token_expires
    )
    
    # Update session
    supabase.table("sessions").upsert({
        "client_id": client_data["id"],
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + access_token_expires).isoformat(),
        "last_activity": datetime.utcnow().isoformat()
    }).execute()
    
    return {"access_token": access_token, "token_type": "bearer"}

# Client endpoints
@app.post("/clients/", response_model=Client)
async def create_client(client: ClientCreate):
    # Check if email already exists
    existing_client = supabase.table("clients").select("*").eq("email", client.email).execute()
    if existing_client.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create client
    new_client = supabase.table("clients").insert({
        "name": client.name,
        "email": client.email,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).execute()
    
    # Create authentication record
    supabase.table("authentication").insert({
        "client_id": new_client.data[0]["id"],
        "password_hash": get_password_hash(client.password),
        "last_login": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).execute()
    
    return new_client.data[0]

@app.get("/clients/", response_model=List[Client])
async def read_clients(skip: int = 0, limit: int = 100, current_client: dict = Depends(get_current_client)):
    clients = supabase.table("clients").select("*").range(skip, skip + limit).execute()
    return clients.data

@app.get("/clients/{client_id}", response_model=Client)
async def read_client(client_id: int, current_client: dict = Depends(get_current_client)):
    client = supabase.table("clients").select("*").eq("id", client_id).execute()
    if not client.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return client.data[0]

@app.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: int, client: ClientBase, current_client: dict = Depends(get_current_client)):
    if client_id != current_client["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this client")
    
    updated_client = supabase.table("clients").update({
        "name": client.name,
        "email": client.email,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", client_id).execute()
    
    if not updated_client.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return updated_client.data[0]

@app.delete("/clients/{client_id}")
async def delete_client(client_id: int, current_client: dict = Depends(get_current_client)):
    if client_id != current_client["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this client")
    
    # Delete related records
    supabase.table("authentication").delete().eq("client_id", client_id).execute()
    supabase.table("sessions").delete().eq("client_id", client_id).execute()
    
    # Delete client
    result = supabase.table("clients").delete().eq("id", client_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 