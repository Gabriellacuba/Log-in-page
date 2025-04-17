from fastapi import APIRouter, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from ..models.client import ClientResponse, ClientUpdate
from ..services.clients import ClientService
from ..services.auth import AuthService

security = HTTPBearer()
router = APIRouter(prefix="/clients", tags=["clients"])

@router.get("/", response_model=List[ClientResponse])
async def get_clients(credentials: HTTPAuthorizationCredentials = Security(security)):
    return await ClientService.get_all_clients()

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, credentials: HTTPAuthorizationCredentials = Security(security)):
    return await ClientService.get_client_by_id(client_id)

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int, 
    client_update: ClientUpdate,
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    return await ClientService.update_client(client_id, client_update)

@router.delete("/{client_id}")
async def delete_client(client_id: int, credentials: HTTPAuthorizationCredentials = Security(security)):
    return await ClientService.delete_client(client_id) 