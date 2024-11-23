"""Main FastAPI application instance."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.init_db import init_db
from .api.api_v1.api import api_router

# Configure logging at the root level
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True  # Force reconfiguration of the root logger
)

# Get the root logger
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# Ensure all other loggers inherit this configuration
logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)
logging.getLogger('fastapi').setLevel(logging.DEBUG)
logging.getLogger('uvicorn').setLevel(logging.DEBUG)

# Module logger
module_logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    """Create FastAPI application with configurations.
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    module_logger.debug("Creating FastAPI application")
    application = FastAPI(
        title=settings.APP_NAME,
        debug=settings.DEBUG,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )

    # Set CORS middleware with specific origins
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Added for Next.js dev server alternate port
        "http://127.0.0.1:3001",
    ]
    
    module_logger.debug("Adding CORS middleware")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    module_logger.debug("Including API router")
    application.include_router(api_router, prefix=settings.API_V1_STR)

    return application

app = create_application()

@app.on_event("startup")
async def startup_event():
    """Initialize application services on startup."""
    module_logger.info("Starting up BMS API...")
    try:
        module_logger.debug("Initializing database")
        init_db()
        module_logger.info("Database initialization completed successfully")
    except Exception as e:
        module_logger.error(f"Failed to initialize database: {e}", exc_info=True)
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup application services on shutdown."""
    module_logger.info("Shutting down BMS API...")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint.
    
    Returns:
        dict: Health status
    """
    module_logger.debug("Health check requested")
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": "1.0.0"
    }
