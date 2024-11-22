"""Database session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

# Create engine with echo=True for debugging
# Note: SQLite uses NullPool, so we don't specify pool_size or max_overflow
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,  # This will log all SQL statements
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session  # Explicitly specify Session class
)

def test_connection() -> bool:
    """
    Test the database connection.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False
    finally:
        db.close()

# Add diagnostic logging
logger.debug(f"SessionLocal type: {type(SessionLocal)}")
logger.debug(f"Engine type: {type(engine)}")
