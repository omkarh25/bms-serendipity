from fastapi import FastAPI
from .api.api_v1.api import api_router
from .db.init_db import init_db
from .db.session import engine, SessionLocal
from sqlalchemy import inspect
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up BMS API...")
    try:
        # Initialize database
        init_db()
        
        # Verify database connection
        db = SessionLocal()
        try:
            # Test query
            result = db.execute("SELECT 1").scalar()
            logger.info(f"Database connection test result: {result}")
            
            # Log database engine details
            logger.info(f"Database URL: {engine.url}")
            logger.info(f"Database dialect: {engine.dialect.name}")
            
            # Inspect and log table information
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            logger.info(f"Available database tables: {tables}")
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

app.include_router(api_router, prefix="/api/v1")