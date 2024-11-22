import logging
from typing import Generator
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import SessionLocal

logger = logging.getLogger(__name__)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    logger.debug("Opening new database session")
    try:
        # Verify session is active
        db.execute("SELECT 1")
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        logger.debug("Closing database session")
        db.close() 