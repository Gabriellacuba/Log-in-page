from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
import re

class ClientBase(BaseModel):
    client_name: str
    email: str

    @field_validator('email')
    def validate_email(cls, v):
        # Basic email format check
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError(f"Invalid email format: {v}. Please use a valid email address.")
        return v.lower()  # Convert to lowercase for consistency

class ClientCreate(ClientBase):
    password: str

class ClientUpdate(BaseModel):
    client_name: Optional[str] = None
    email: Optional[str] = None

    @field_validator('email')
    def validate_email(cls, v):
        if v is not None:
            if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
                raise ValueError(f"Invalid email format: {v}. Please use a valid email address.")
            return v.lower()
        return v

class ClientInDB(ClientBase):
    id: int
    created_at: datetime
    update_at: Optional[datetime] = None

class ClientResponse(ClientInDB):
    pass 