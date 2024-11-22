"""CRUD operations for all models."""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import date
from decimal import Decimal

from app.models.models import TransactionsPast, AccountsPresent, FreedomFuture
from app.schemas import schemas
from .base import CRUDBase

class CRUDTransaction(
    CRUDBase[TransactionsPast, schemas.TransactionCreate, schemas.TransactionUpdate]
):
    """CRUD operations for transactions."""
    
    def get_by_sl_no(self, db: Session, sl_no: int) -> Optional[TransactionsPast]:
        """Get transaction by serial number."""
        return db.query(TransactionsPast).filter(TransactionsPast.sl_no == sl_no).first()

    def get_by_date_range(
        self, db: Session, start_date: date, end_date: date
    ) -> List[TransactionsPast]:
        """Get transactions within a date range."""
        return db.query(TransactionsPast).filter(
            and_(
                TransactionsPast.date >= start_date,
                TransactionsPast.date <= end_date
            )
        ).order_by(desc(TransactionsPast.date)).all()

    def get_by_category(
        self, db: Session, category: str, skip: int = 0, limit: int = 100
    ) -> List[TransactionsPast]:
        """Get transactions by category."""
        return db.query(TransactionsPast).filter(
            TransactionsPast.category == category
        ).offset(skip).limit(limit).all()

    def get_by_department(
        self, db: Session, department: str, skip: int = 0, limit: int = 100
    ) -> List[TransactionsPast]:
        """Get transactions by department."""
        return db.query(TransactionsPast).filter(
            TransactionsPast.department == department
        ).offset(skip).limit(limit).all()

class CRUDAccount(
    CRUDBase[AccountsPresent, schemas.AccountCreate, schemas.AccountUpdate]
):
    """CRUD operations for accounts."""
    
    def get_by_sl_no(self, db: Session, sl_no: int) -> Optional[AccountsPresent]:
        """Get account by serial number."""
        return db.query(AccountsPresent).filter(AccountsPresent.sl_no == sl_no).first()

    def get_by_cc_id(self, db: Session, cc_id: str) -> Optional[AccountsPresent]:
        """Get account by CC ID."""
        return db.query(AccountsPresent).filter(AccountsPresent.cc_id == cc_id).first()

    def get_by_type(
        self, db: Session, account_type: str, skip: int = 0, limit: int = 100
    ) -> List[AccountsPresent]:
        """Get accounts by type."""
        return db.query(AccountsPresent).filter(
            AccountsPresent.type == account_type
        ).offset(skip).limit(limit).all()

    def get_accounts_due(self, db: Session, due_date: str) -> List[AccountsPresent]:
        """Get accounts with specified due date."""
        return db.query(AccountsPresent).filter(
            AccountsPresent.next_due_date == due_date
        ).all()

    def update_balance(
        self, db: Session, *, cc_id: str, amount: Decimal
    ) -> Optional[AccountsPresent]:
        """Update account balance."""
        account = self.get_by_cc_id(db, cc_id)
        if account:
            account.balance += amount
            db.add(account)
            db.commit()
            db.refresh(account)
        return account

class CRUDFuture(
    CRUDBase[FreedomFuture, schemas.FutureCreate, schemas.FutureUpdate]
):
    """CRUD operations for future predictions."""
    
    def get_by_tr_no(self, db: Session, tr_no: int) -> Optional[FreedomFuture]:
        """Get future prediction by transaction number."""
        return db.query(FreedomFuture).filter(FreedomFuture.tr_no == tr_no).first()

    def get_unpaid(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[FreedomFuture]:
        """Get unpaid future predictions."""
        return db.query(FreedomFuture).filter(
            FreedomFuture.paid == False
        ).offset(skip).limit(limit).all()

    def get_by_date_range(
        self, db: Session, start_date: date, end_date: date
    ) -> List[FreedomFuture]:
        """Get future predictions within a date range."""
        return db.query(FreedomFuture).filter(
            and_(
                FreedomFuture.date >= start_date,
                FreedomFuture.date <= end_date
            )
        ).order_by(FreedomFuture.date).all()

    def mark_as_paid(self, db: Session, tr_no: int) -> Optional[FreedomFuture]:
        """Mark a future prediction as paid."""
        future = self.get_by_tr_no(db, tr_no)
        if future:
            future.paid = True
            db.add(future)
            db.commit()
            db.refresh(future)
        return future

# Create CRUD instances
transaction = CRUDTransaction(TransactionsPast)
account = CRUDAccount(AccountsPresent)
future = CRUDFuture(FreedomFuture)
