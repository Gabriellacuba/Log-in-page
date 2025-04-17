from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from ..config.settings import settings
import logging

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    print(f"Debug - verify_password called:")
    print(f"Debug - Provided password length: {len(plain_password)}")
    print(f"Debug - Stored hash: {hashed_password}")
    
    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print(f"Debug - Password verification result: {result}")
        
        # If verification failed, try to generate a new hash to compare the formats
        if not result:
            new_hash = pwd_context.hash(plain_password)
            print(f"Debug - New hash with same password: {new_hash}")
            print(f"Debug - Hash format comparison - DB hash: {hashed_password[:7]}, New hash: {new_hash[:7]}")
            
        return result
    except Exception as e:
        print(f"Debug - Error during password verification: {str(e)}")
        print(f"Debug - Error type: {type(e)}")
        return False

def get_password_hash(password: str) -> str:
    hash_result = pwd_context.hash(password)
    print(f"Debug - Generated password hash: {hash_result}")
    return hash_result

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM) 