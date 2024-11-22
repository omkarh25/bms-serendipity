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
logger = logging.getLogger(__name__)

# Database URL - Using SQLite for development
SQLALCHEMY_DATABASE_URL = "sqlite:///./kaas.db"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
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
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {str(e)}")
        raise
    finally:
        db.close()

# For explicit context manager usage (e.g., in scripts)
@contextmanager
def db_session():
    """
    Context manager for database sessions.
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {str(e)}")
        raise
    finally:
        db.close()

def init_db() -> None:
    """Initialize the database, creating all tables and print their contents."""
    from app.models.base import Base
    from app.models.models import TransactionsPast, AccountsPresent, FreedomFuture
    
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
        
        # Use db_session instead of get_db for script context
        with db_session() as db:
            # Query and print data from all tables
            transactions = db.query(TransactionsPast).all()
            accounts = db.query(AccountsPresent).all()
            freedom = db.query(FreedomFuture).all()
            
            print("=== TransactionsPast Table Data ===")
            for transaction in transactions:
                print(f"Transaction: {transaction.__dict__}")
                
            print("\n=== AccountsPresent Table Data ===")
            for account in accounts:
                print(f"Account: {account.__dict__}")
                
            print("\n=== FreedomFuture Table Data ===")
            for future in freedom:
                print(f"Future Goal: {future.__dict__}")
                
            if not any([transactions, accounts, freedom]):
                print("No data found in any of the tables")
                
    except SQLAlchemyError as e:
        print(f"Error accessing database tables: {str(e)}")
        raise