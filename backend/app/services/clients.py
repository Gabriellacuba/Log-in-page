from fastapi import HTTPException
from ..models.client import ClientUpdate
from ..database.supabase import supabase
import logging

logger = logging.getLogger(__name__)

class ClientService:
    @staticmethod
    async def get_all_clients():
        try:
            response = supabase.table("Clients").select("*").execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def get_client_by_id(client_id: int):
        try:
            response = supabase.table("Clients").select("*").eq("id", client_id).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Client not found")
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def update_client(client_id: int, client_update: ClientUpdate):
        try:
            # First check if client exists
            result = supabase.table("Clients").select("*").eq("id", client_id).execute()
            if not result.data:
                raise HTTPException(status_code=404, detail="Client not found")
            
            # Update client
            update_data = client_update.dict(exclude_unset=True)
            result = supabase.table("Clients").update(update_data).eq("id", client_id).execute()
            return result.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def delete_client(client_id: int):
        logger.debug(f"\n=== Starting client deletion process for ID: {client_id} ===")
        
        try:
            # First delete session records
            logger.debug("Deleting session records...")
            session_result = supabase.table("Sessions").delete().eq("client_id", client_id).execute()
            logger.debug(f"Session deletion response: {session_result}")
            
            # Then delete authentication records
            logger.debug("Deleting authentication records...")
            auth_result = supabase.table("Authentication").delete().eq("client_id", client_id).execute()
            logger.debug(f"Authentication deletion response: {auth_result}")
            
            # Finally delete client
            logger.debug("Deleting client record...")
            client_result = supabase.table("Clients").delete().eq("id", client_id).execute()
            logger.debug(f"Client deletion response: {client_result}")
            
            if not client_result.data:
                raise HTTPException(status_code=404, detail="Client not found")
            
            logger.debug("=== Client deletion successful ===")
            return {"message": "Client deleted successfully"}
            
        except Exception as e:
            logger.debug(f"\n=== Error during deletion ===")
            logger.debug(f"Error type: {type(e)}")
            logger.debug(f"Error message: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e)) 