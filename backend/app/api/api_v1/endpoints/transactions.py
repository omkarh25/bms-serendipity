"""API endpoints for transactions."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.crud import crud
from app.schemas.transaction import Transaction, TransactionCreate, TransactionUpdate
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[Transaction])
async def get_transactions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = None,
    department: Optional[str] = None
):
    """Get list of transactions with optional filtering."""
    try:
        transactions = crud.transaction.get_all(db, skip=skip, limit=limit)
        
        # Filter by category if provided
        if category:
            transactions = [t for t in transactions if t.Category == category]
            
        # Filter by department if provided    
        if department:
            transactions = [t for t in transactions if t.Department == department]
            
        return transactions
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/date-range", response_model=List[Transaction])
async def get_transactions_by_date_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """Get transactions within a date range.
    
    Args:
        start_date: Start date
        end_date: End date
        db: Database session
    
    Returns:
        List[Transaction]: List of transactions
    """
    try:
        transactions = crud.transaction.get_by_date_range(db, start_date, end_date)
        return transactions
    except Exception as e:
        logger.error(f"Error fetching transactions by date range: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching transactions by date range"
        )

@router.get("/{sl_no}", response_model=Transaction)
async def get_transaction(sl_no: int, db: Session = Depends(get_db)):
    """Get transaction by serial number.
    
    Args:
        sl_no: Transaction serial number
        db: Database session
    
    Returns:
        Transaction: Transaction details
    
    Raises:
        HTTPException: If transaction not found
    """
    transaction = crud.transaction.get_by_sl_no(db, sl_no)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/", response_model=Transaction)
async def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new transaction.
    
    Args:
        transaction_in: Transaction data
        db: Database session
    
    Returns:
        Transaction: Created transaction
    """
    try:
        # Verify account exists
        account = crud.account.get_by_cc_id(db, transaction_in.acc_id)
        if not account:
            raise HTTPException(
                status_code=404,
                detail=f"Account with ID {transaction_in.acc_id} not found"
            )

        # Create transaction
        transaction = crud.transaction.create(db, obj_in=transaction_in)

        # Update account balance
        crud.account.update_balance(
            db, cc_id=transaction_in.acc_id, amount=transaction_in.amount
        )

        return transaction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating transaction: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating transaction")

@router.put("/{sl_no}", response_model=Transaction)
async def update_transaction(
    sl_no: int,
    transaction_in: TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update a transaction.
    
    Args:
        sl_no: Transaction serial number
        transaction_in: Updated transaction data
        db: Database session
    
    Returns:
        Transaction: Updated transaction
    
    Raises:
        HTTPException: If transaction not found
    """
    try:
        transaction = crud.transaction.get_by_sl_no(db, sl_no)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # If account ID is being updated, verify new account exists
        if transaction_in.acc_id and transaction_in.acc_id != transaction.acc_id:
            account = crud.account.get_by_cc_id(db, transaction_in.acc_id)
            if not account:
                raise HTTPException(
                    status_code=404,
                    detail=f"Account with ID {transaction_in.acc_id} not found"
                )

        # If amount is being updated, adjust account balances
        if transaction_in.amount and transaction_in.amount != transaction.amount:
            # Reverse old transaction
            crud.account.update_balance(
                db, cc_id=transaction.acc_id, amount=-transaction.amount
            )
            # Apply new transaction
            crud.account.update_balance(
                db, cc_id=transaction_in.acc_id or transaction.acc_id,
                amount=transaction_in.amount
            )

        updated_transaction = crud.transaction.update(
            db, db_obj=transaction, obj_in=transaction_in
        )
        return updated_transaction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating transaction: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating transaction")

@router.delete("/{sl_no}", response_model=Transaction)
async def delete_transaction(sl_no: int, db: Session = Depends(get_db)):
    """Delete a transaction.
    
    Args:
        sl_no: Transaction serial number
        db: Database session
    
    Returns:
        Transaction: Deleted transaction
    
    Raises:
        HTTPException: If transaction not found
    """
    try:
        transaction = crud.transaction.get_by_sl_no(db, sl_no)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # Reverse the transaction amount from account balance
        crud.account.update_balance(
            db, cc_id=transaction.acc_id, amount=-transaction.amount
        )

        deleted_transaction = crud.transaction.remove(db, id=sl_no)
        return deleted_transaction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting transaction: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting transaction")
