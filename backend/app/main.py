from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, clients
from .config.settings import settings

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
    allow_origins=["*"],  # In production, replace with specific origins
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