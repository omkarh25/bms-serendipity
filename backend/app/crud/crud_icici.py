"""CRUD operations for ICICI bank transactions."""

import logging
from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from decimal import Decimal

from app.models.models import ICICISavingsTransactions, TransactionsPast
from app.schemas.schemas import ICICITransactionCreate, ICICITransactionUpdate

logger = logging.getLogger(__name__)

def get_by_id(db: Session, transaction_id: int) -> Optional[ICICISavingsTransactions]:
    """Get ICICI transaction by ID."""
    return db.query(ICICISavingsTransactions).filter(ICICISavingsTransactions.id == transaction_id).first()

def get_by_ref_no(db: Session, ref_no: str) -> Optional[ICICISavingsTransactions]:
    """Get ICICI transaction by reference number."""
    return db.query(ICICISavingsTransactions).filter(ICICISavingsTransactions.ref_no == ref_no).first()

def get_all(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    reconciled: Optional[bool] = None
) -> List[ICICISavingsTransactions]:
    """Get all ICICI transactions with optional reconciliation filter."""
    query = db.query(ICICISavingsTransactions)
    if reconciled is not None:
        query = query.filter(ICICISavingsTransactions.reconciled == reconciled)
    return query.offset(skip).limit(limit).all()

def create(db: Session, *, obj_in: ICICITransactionCreate) -> ICICISavingsTransactions:
    """Create new ICICI transaction."""
    db_obj = ICICISavingsTransactions(
        transaction_date=obj_in.transaction_date,
        value_date=obj_in.value_date,
        description=obj_in.description,
        ref_no=obj_in.ref_no,
        debit=obj_in.debit,
        credit=obj_in.credit,
        balance=obj_in.balance,
        reconciled=obj_in.reconciled,
        transaction_id=obj_in.transaction_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(
    db: Session,
    *,
    db_obj: ICICISavingsTransactions,
    obj_in: ICICITransactionUpdate
) -> ICICISavingsTransactions:
    """Update ICICI transaction."""
    if obj_in.reconciled is not None:
        db_obj.reconciled = obj_in.reconciled
    if obj_in.transaction_id is not None:
        db_obj.transaction_id = obj_in.transaction_id
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def remove(db: Session, *, id: int) -> ICICISavingsTransactions:
    """Delete ICICI transaction."""
    obj = db.query(ICICISavingsTransactions).get(id)
    db.delete(obj)
    db.commit()
    return obj

def get_unreconciled_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[ICICISavingsTransactions]:
    """Get unreconciled ICICI transactions."""
    return db.query(ICICISavingsTransactions)\
        .filter(ICICISavingsTransactions.reconciled == False)\
        .offset(skip)\
        .limit(limit)\
        .all()

def find_matching_transaction(
    db: Session,
    icici_transaction: ICICISavingsTransactions,
    tolerance: Decimal = Decimal('0.01')
) -> Optional[TransactionsPast]:
    """
    Find matching transaction in TransactionsPast table.
    
    Args:
        db: Database session
        icici_transaction: ICICI transaction to match
        tolerance: Amount difference tolerance (default: 0.01)
        
    Returns:
        Optional[TransactionsPast]: Matching transaction if found
    """
    amount = icici_transaction.debit or icici_transaction.credit
    if amount is None:
        return None
        
    # Look for transactions with matching date and amount
    matches = db.query(TransactionsPast).filter(
        and_(
            TransactionsPast.Date == icici_transaction.transaction_date,
            or_(
                TransactionsPast.Amount >= amount - tolerance,
                TransactionsPast.Amount <= amount + tolerance
            ),
            TransactionsPast.PaymentMode == "ICICI_090"
        )
    ).all()
    
    if not matches:
        return None
        
    # If multiple matches found, try to match by description
    if len(matches) > 1:
        for match in matches:
            if any(word.lower() in icici_transaction.description.lower() 
                  for word in match.Description.split()):
                return match
        # If no description match, return the first match
        return matches[0]
        
    return matches[0]

def reconcile_transactions(db: Session) -> dict:
    """
    Reconcile unreconciled ICICI transactions with main transactions.
    
    Returns:
        dict: Reconciliation statistics
    """
    stats = {
        "total_transactions": 0,
        "reconciled_transactions": 0,
        "unreconciled_transactions": 0
    }
    
    unreconciled = get_unreconciled_transactions(db)
    stats["total_transactions"] = len(unreconciled)
    
    for transaction in unreconciled:
        matching_transaction = find_matching_transaction(db, transaction)
        if matching_transaction:
            update(db, db_obj=transaction, obj_in=ICICITransactionUpdate(
                reconciled=True,
                transaction_id=matching_transaction.TrNo
            ))
            stats["reconciled_transactions"] += 1
        else:
            stats["unreconciled_transactions"] += 1
            
    return stats

def bulk_create_transactions(
    db: Session,
    transactions: List[ICICITransactionCreate]
) -> dict:
    """
    Bulk create ICICI transactions from bank statement.
    
    Args:
        db: Database session
        transactions: List of transactions to create
        
    Returns:
        dict: Upload statistics
    """
    stats = {
        "total_transactions": len(transactions),
        "new_transactions": 0,
        "duplicate_transactions": 0
    }
    
    for transaction in transactions:
        # Check if transaction already exists
        existing = get_by_ref_no(db, transaction.ref_no)
        if existing:
            stats["duplicate_transactions"] += 1
            continue
            
        create(db, obj_in=transaction)
        stats["new_transactions"] += 1
        
    return stats
