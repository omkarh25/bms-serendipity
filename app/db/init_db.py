import logging
from sqlalchemy.exc import SQLAlchemyError
from .session import engine, SessionLocal
from ..models import Base  # Import all your models
from ..models.transaction import Transaction  # Import specific models
from ..models.account import Account
# Import other models as needed

logger = logging.getLogger(__name__)

def init_db() -> None:
    try:
        # Create a test connection to verify database is accessible
        db = SessionLocal()
        try:
            # Test the connection
            db.execute("SELECT 1")
            logger.info("Database connection successful")
        except SQLAlchemyError as e:
            logger.error(f"Database connection failed: {e}")
            raise
        finally:
            db.close()

        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Verify tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Available tables: {tables}")
        
        # Verify each required table
        required_tables = ['transactions', 'accounts']  # Add all your required tables
        for table in required_tables:
            if table not in tables:
                logger.error(f"Required table '{table}' is missing!")
            else:
                logger.info(f"Table '{table}' verified")
                # Log table columns for verification
                columns = [col['name'] for col in inspector.get_columns(table)]
                logger.info(f"Columns in {table}: {columns}")

    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise 