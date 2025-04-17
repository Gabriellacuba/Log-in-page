from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

print("\n=== Loading Environment Variables ===")
load_dotenv()

print(f"SUPABASE_URL from env: {os.getenv('SUPABASE_URL')}")
print(f"SUPABASE_KEY from env: {os.getenv('SUPABASE_KEY')}")
print(f"JWT_SECRET from env: {os.getenv('JWT_SECRET')}")

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")
    JWT_SECRET: str = os.getenv("JWT_SECRET")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
print("\n=== Settings Initialized ===")
print(f"Settings SUPABASE_URL: {settings.SUPABASE_URL}")
print(f"Settings SUPABASE_KEY length: {len(settings.SUPABASE_KEY)}")
print(f"Settings JWT_SECRET length: {len(settings.JWT_SECRET)}") 