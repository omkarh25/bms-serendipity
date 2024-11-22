"""
Configuration settings for the application
"""
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings
    
    Attributes:
        API_V1_STR: API version string
        PROJECT_NAME: Name of the project
        APP_NAME: Application name
        DEBUG: Debug mode flag
        TELEGRAM_API_ID: Telegram API ID
        TELEGRAM_API_HASH: Telegram API Hash
        TELEGRAM_PHONE_NUMBER: Telegram phone number
        TELEGRAM_CHANNEL_ID: Telegram channel ID
        DATABASE_URL: SQLite database URL
    """
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BMS Serendipity"
    APP_NAME: str = "BMS Serendipity"
    DEBUG: bool = True
    
    # Telegram Settings
    TELEGRAM_API_ID: int  # Changed to int
    TELEGRAM_API_HASH: str
    TELEGRAM_PHONE_NUMBER: str
    TELEGRAM_CHANNEL_ID: int
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    
    class Config:
        env_file = ".env"

settings = Settings()
