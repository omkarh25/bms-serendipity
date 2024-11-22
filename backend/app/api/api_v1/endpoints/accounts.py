"""API endpoints for accounts."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from decimal import Decimal

from app.db.database import get_db
from app.crud import crud
from app.schemas import schemas
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[schemas.Account])
async def get_accounts(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    account_type: Optional[str] = None
):
    """Get list of accounts with optional type filtering.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        account_type: Optional account type filter
    
    Returns:
        List[schemas.Account]: List of accounts
    """
    try:
        if account_type:
            accounts = crud.account.get_by_type(db, account_type, skip, limit)
        else:
            accounts = crud.account.get_all(db)
        return accounts
    except Exception as e:
        logger.error(f"Error fetching accounts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching accounts")

@router.get("/due/{due_date}", response_model=List[schemas.Account])
async def get_accounts_by_due_date(due_date: str, db: Session = Depends(get_db)):
    """Get accounts with specified due date.
    
    Args:
        due_date: Due date to filter by
        db: Database session
    
    Returns:
        List[schemas.Account]: List of accounts with specified due date
    """
    try:
        accounts = crud.account.get_accounts_due(db, due_date)
        return accounts
    except Exception as e:
        logger.error(f"Error fetching accounts by due date: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching accounts by due date"
        )

@router.get("/{sl_no}", response_model=schemas.Account)
async def get_account(sl_no: int, db: Session = Depends(get_db)):
    """Get account by serial number.
    
    Args:
        sl_no: Account serial number
        db: Database session
    
    Returns:
        schemas.Account: Account details
    
    Raises:
        HTTPException: If account not found
    """
    account = crud.account.get_by_sl_no(db, sl_no)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.get("/by-ccid/{cc_id}", response_model=schemas.Account)
async def get_account_by_cc_id(cc_id: str, db: Session = Depends(get_db)):
    """Get account by CC ID.
    
    Args:
        cc_id: Account CC ID
        db: Database session
    
    Returns:
        schemas.Account: Account details
    
    Raises:
        HTTPException: If account not found
    """
    account = crud.account.get_by_cc_id(db, cc_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.post("/", response_model=schemas.Account)
async def create_account(
    account_in: schemas.AccountCreate,
    db: Session = Depends(get_db)
):
    """Create a new account.
    
    Args:
        account_in: Account data
        db: Database session
    
    Returns:
        schemas.Account: Created account
    """
    try:
        # Check if account with same CC ID already exists
        existing_account = crud.account.get_by_cc_id(db, account_in.cc_id)
        if existing_account:
            raise HTTPException(
                status_code=400,
                detail=f"Account with CC ID {account_in.cc_id} already exists"
            )

        account = crud.account.create(db, obj_in=account_in)
        return account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating account: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating account")

@router.put("/{sl_no}", response_model=schemas.Account)
async def update_account(
    sl_no: int,
    account_in: schemas.AccountUpdate,
    db: Session = Depends(get_db)
):
    """Update an account.
    
    Args:
        sl_no: Account serial number
        account_in: Updated account data
        db: Database session
    
    Returns:
        schemas.Account: Updated account
    
    Raises:
        HTTPException: If account not found
    """
    try:
        account = crud.account.get_by_sl_no(db, sl_no)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        updated_account = crud.account.update(db, db_obj=account, obj_in=account_in)
        return updated_account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating account: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating account")

@router.patch("/{cc_id}/balance", response_model=schemas.Account)
async def adjust_balance(
    cc_id: str,
    amount: Decimal,
    db: Session = Depends(get_db)
):
    """Adjust account balance.
    
    Args:
        cc_id: Account CC ID
        amount: Amount to adjust (positive for credit, negative for debit)
        db: Database session
    
    Returns:
        schemas.Account: Updated account
    
    Raises:
        HTTPException: If account not found
    """
    try:
        account = crud.account.get_by_cc_id(db, cc_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        updated_account = crud.account.update_balance(db, cc_id=cc_id, amount=amount)
        return updated_account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adjusting account balance: {str(e)}")
        raise HTTPException(status_code=500, detail="Error adjusting account balance")

@router.delete("/{sl_no}", response_model=schemas.Account)
async def delete_account(sl_no: int, db: Session = Depends(get_db)):
    """Delete an account.
    
    Args:
        sl_no: Account serial number
        db: Database session
    
    Returns:
        schemas.Account: Deleted account
    
    Raises:
        HTTPException: If account not found or has associated transactions
    """
    try:
        account = crud.account.get_by_sl_no(db, sl_no)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        # Check for associated transactions
        if account.past_transactions or account.future_transactions:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete account with associated transactions"
            )

        deleted_account = crud.account.remove(db, id=sl_no)
        return deleted_account
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting account")
