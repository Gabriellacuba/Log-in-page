"""
Supabase Database Client
-----------------------

This module initializes the connection to Supabase and provides
the client instance to the rest of the application.

The connection is established using environment variables:
- SUPABASE_URL: The URL of the Supabase project
- SUPABASE_KEY: The service key for the Supabase project

Connection details are logged for debugging purposes.
"""

from supabase import create_client
from ..config.settings import settings
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

print("\n=== Initializing Supabase Client ===")
print(f"Supabase URL: {settings.SUPABASE_URL}")
print(f"Supabase Key length: {len(settings.SUPABASE_KEY)} characters")

try:
    # Create and initialize the Supabase client
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    print("Supabase client initialized successfully")
except Exception as e:
    print(f"Error initializing Supabase client: {str(e)}")
    raise 