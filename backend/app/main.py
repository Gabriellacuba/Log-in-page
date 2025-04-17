from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, clients
from .config.settings import settings
from .database.supabase import supabase

# Define allowed origins
origins = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite development server
    "http://127.0.0.1:5173"
]

app = FastAPI(
    title="Client Authentication API",
    description="API for client authentication and management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use the defined origins list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(clients.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Client Authentication API"}

@app.get("/health/database")
async def check_db():
    try:
        result = supabase.table("Clients").select("count", count="exact").execute()
        return {"status": "connected", "client_count": result.count}
    except Exception as e:
        return {"status": "error", "message": str(e)} 