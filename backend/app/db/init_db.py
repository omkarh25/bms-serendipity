import logging
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect
from .session import engine, SessionLocal
from ..models.models import Base, TransactionsPast, AccountsPresent  # Import from models.py
from ..db.migrations.create_icici_transactions import create_icici_transactions_table

logger = logging.getLogger(__name__)

def init_db() -> None:
    """
    Initialize the database by creating all tables and verifying the setup
    
    This function:
    1. Tests the database connection
    2. Creates all tables defined in the models
    3. Creates ICICI transactions table using migration
    4. Verifies that required tables exist
    5. Logs table structure for verification
    
    Raises:
        SQLAlchemyError: If database connection fails
        Exception: For any other initialization errors
    """
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
        
        # Run ICICI transactions table migration
        logger.info("Running ICICI transactions table migration...")
        create_icici_transactions_table()
        
        # Verify tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Available tables: {tables}")
        
        # Verify each required table
        required_tables = ['Transactions(Past)', 'Accounts(Present)', 'Freedom(Future)', 'ICICI_Savings_Transactions']
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
