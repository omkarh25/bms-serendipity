import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .... import crud, schemas
from ....api import deps

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[schemas.Transaction])
async def get_transactions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
):
    # Add diagnostic logging
    logger.debug(f"Type of db object: {type(db)}")
    logger.debug(f"DB object attributes: {dir(db)}")
    
    try:
        transactions = crud.transaction.get_multi(db=db, skip=skip, limit=limit)
        return transactions
    except Exception as e:
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Full error details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 