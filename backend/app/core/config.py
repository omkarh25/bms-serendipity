"""Application configuration settings."""

from pydantic import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    """Application settings.
    
    Attributes:
        APP_NAME: Name of the application
        DEBUG: Debug mode flag
        API_V1_STR: API version prefix
        PROJECT_ROOT: Root directory of the project
        DATABASE_URL: Database connection URL
        SECRET_KEY: Secret key for JWT token generation
        ACCESS_TOKEN_EXPIRE_MINUTES: JWT token expiration time in minutes
    """
    
    APP_NAME: str = "BMS API"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    PROJECT_ROOT: str = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    DATABASE_URL: str = "sqlite:///./kaas.db"
    SECRET_KEY: str = "your-secret-key-for-jwt"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        case_sensitive = True

# Create global settings object
settings = Settings()
