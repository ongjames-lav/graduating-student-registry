from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models  # Import models to ensure they are registered with SQLAlchemy
from routes import router
from database import engine, Base

# Create FastAPI instance
app = FastAPI(title="Student Registry API")

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure CORS - Development settings (more permissive)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=False,  # Must be False if allow_origins=["*"]
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routes
app.include_router(router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Student Registry API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
