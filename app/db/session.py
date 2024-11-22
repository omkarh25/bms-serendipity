from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import logging
from ..core.config import settings  # Assuming you have your database URL in settings

logger = logging.getLogger(__name__)

# Make sure your database URL is correctly set
SQLALCHEMY_DATABASE_URL = settings.SQLALCHEMY_DATABASE_URL

# Create engine with echo=True for debugging
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,  # This will log all SQL statements
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session  # Explicitly specify Session class
)

# Add connection testing function
def test_connection():
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