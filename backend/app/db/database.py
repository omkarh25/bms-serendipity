"""Database configuration and session management."""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
from typing import Generator
import os
from sqlalchemy.ext.declarative import declarative_base
from app.models.models import Base

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Get the absolute path to the database file
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../kaas.db'))
logger.debug(f"Database path: {DB_PATH}")

# Database URL - Using SQLite for development
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
logger.debug(f"Database URL: {SQLALCHEMY_DATABASE_URL}")

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=True  # Enable SQL query logging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency.
    
    Yields:
        Session: Database session
    
    Raises:
        SQLAlchemyError: If there's any database related error
    """
    logger.debug("Creating new database session")
    db = SessionLocal()
    try:
        logger.debug(f"Database session created: {id(db)}")
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise
    finally:
        logger.debug(f"Closing database session: {id(db)}")
        db.close()

# For explicit context manager usage (e.g., in scripts)
@contextmanager
def db_session():
    """
    Context manager for database sessions.
    
    Yields:
        Session: Database session
    """
    logger.debug("Creating new database session (context manager)")
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise
    finally:
        logger.debug("Closing database session (context manager)")
        db.close()

def init_db() -> None:
    """Initialize the database, creating all tables and print their contents."""
    from app.models.base import Base
    from app.models.models import TransactionsPast, AccountsPresent, FreedomFuture
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Use db_session instead of get_db for script context
        with db_session() as db:
            # Query and print data from all tables
            transactions = db.query(TransactionsPast).all()
            accounts = db.query(AccountsPresent).all()
            freedom = db.query(FreedomFuture).all()
            
            logger.debug("=== TransactionsPast Table Data ===")
            for transaction in transactions:
                logger.debug(f"Transaction: {transaction.__dict__}")
                
            logger.debug("\n=== AccountsPresent Table Data ===")
            for account in accounts:
                logger.debug(f"Account: {account.__dict__}")
                
            logger.debug("\n=== FreedomFuture Table Data ===")
            for future in freedom:
                logger.debug(f"Future Goal: {future.__dict__}")
                
            if not any([transactions, accounts, freedom]):
                logger.warning("No data found in any of the tables")
                
    except SQLAlchemyError as e:
        logger.error(f"Error accessing database tables: {str(e)}")
        raise
