"""
Dependencies module for FastAPI application.
Following Dependency Injection and Single Responsibility principles.
"""
import logging
from typing import Generator, Optional
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.notification.telegram import TelegramNotificationProvider

logger = logging.getLogger(__name__)

def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency.
    Creates a new database session for each request and ensures proper cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_notification_provider(
    use_cache: bool = False
) -> Optional[TelegramNotificationProvider]:
    """
    Notification provider dependency.
    Returns a configured TelegramNotificationProvider instance.
    
    Args:
        use_cache: If True, doesn't verify connection (useful for batch operations)
    """
    try:
        provider = TelegramNotificationProvider()
        if not use_cache:
            if not await provider.verify_connection():
                if not await provider.connect():
                    logger.warning("Failed to connect to notification service")
                    return None
        return provider
    except Exception as e:
        logger.error(f"Error initializing notification provider: {str(e)}")
        return None
