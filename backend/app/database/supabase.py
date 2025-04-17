from supabase import create_client
from ..config.settings import settings
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

print("\n=== Initializing Supabase Client ===")
print(f"Supabase URL: {settings.SUPABASE_URL}")
print(f"Supabase Key length: {len(settings.SUPABASE_KEY)} characters")

try:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    print("Supabase client initialized successfully")
except Exception as e:
    print(f"Error initializing Supabase client: {str(e)}")
    raise 