from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import between
from datetime import datetime
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate

class CRUDTransaction:
    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Transaction]:
        return db.query(Transaction).offset(skip).limit(limit).all()

    def get_by_sl_no(self, db: Session, sl_no: int) -> Optional[Transaction]:
        return db.query(Transaction).filter(Transaction.TrNo == sl_no).first()

    def get_by_date_range(
        self, db: Session, start_date: datetime, end_date: datetime
    ) -> List[Transaction]:
        return db.query(Transaction).filter(
            between(Transaction.Date, start_date, end_date)
        ).all()

    def create(self, db: Session, *, obj_in: TransactionCreate) -> Transaction:
        # Convert Hand Loans to Hand_Loans for database storage
        category = obj_in.Category
        if category == 'Hand Loans':
            category = 'Hand_Loans'

        db_obj = Transaction(
            Date=obj_in.Date,
            Description=obj_in.Description,
            Amount=obj_in.Amount,
            PaymentMode=obj_in.PaymentMode,
            AccID=obj_in.AccID,
            Department=obj_in.Department,
            Comments=obj_in.Comments,
            Category=category,
            ZohoMatch=obj_in.ZohoMatch
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: Transaction, obj_in: TransactionUpdate
    ) -> Transaction:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Transaction:
        obj = db.query(Transaction).get(id)
        db.delete(obj)
        db.commit()
        return obj

transaction = CRUDTransaction()
