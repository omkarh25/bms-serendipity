"""CRUD operations for accounts."""

import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from decimal import Decimal

from app.crud.base import CRUDBase
from app.models.models import AccountsPresent
from app.schemas.schemas import AccountCreate, AccountUpdate

# Configure logging
logger = logging.getLogger(__name__)

class CRUDAccount(CRUDBase[AccountsPresent, AccountCreate, AccountUpdate]):
    """CRUD operations for accounts.
    
    Extends the base CRUD operations for account-specific functionality.
    """
    
    def get_by_acc_id(self, db: Session, acc_id: str) -> Optional[AccountsPresent]:
        """Get an account by its AccID.
        
        Args:
            db: Database session
            acc_id: Account ID to search for
            
        Returns:
            Optional[AccountsPresent]: Found account or None
        """
        logger.info(f"Fetching account with AccID: {acc_id}")
        try:
            return db.query(self.model).filter(self.model.AccID == acc_id).first()
        except Exception as e:
            logger.error(f"Error fetching account with AccID {acc_id}: {str(e)}")
            raise

    def get_by_sl_no(self, db: Session, sl_no: int) -> Optional[AccountsPresent]:
        """Get an account by its serial number.
        
        Args:
            db: Database session
            sl_no: Serial number to search for
            
        Returns:
            Optional[AccountsPresent]: Found account or None
        """
        logger.info(f"Fetching account with SLNo: {sl_no}")
        try:
            return db.query(self.model).filter(self.model.SLNo == sl_no).first()
        except Exception as e:
            logger.error(f"Error fetching account with SLNo {sl_no}: {str(e)}")
            raise

    def get_by_cc_id(self, db: Session, cc_id: str) -> Optional[AccountsPresent]:
        """Get an account by its CC ID (AccID).
        
        Args:
            db: Database session
            cc_id: CC ID (AccID) to search for
            
        Returns:
            Optional[AccountsPresent]: Found account or None
        """
        logger.info(f"Fetching account with CC ID: {cc_id}")
        try:
            return db.query(self.model).filter(self.model.AccID == cc_id).first()
        except Exception as e:
            logger.error(f"Error fetching account with CC ID {cc_id}: {str(e)}")
            raise

    def get_all(self, db: Session) -> List[AccountsPresent]:
        """Get all accounts.
        
        Args:
            db: Database session
            
        Returns:
            List[AccountsPresent]: List of all accounts
        """
        logger.info("Fetching all accounts")
        try:
            return db.query(self.model).all()
        except Exception as e:
            logger.error(f"Error fetching all accounts: {str(e)}")
            raise

    def get_by_type(self, db: Session, account_type: str, skip: int = 0, limit: int = 100) -> List[AccountsPresent]:
        """Get accounts by type with pagination.
        
        Args:
            db: Database session
            account_type: Type of accounts to fetch
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List[AccountsPresent]: List of accounts of specified type
        """
        logger.info(f"Fetching accounts of type: {account_type}")
        try:
            return db.query(self.model).filter(
                self.model.Type == account_type
            ).offset(skip).limit(limit).all()
        except Exception as e:
            logger.error(f"Error fetching accounts of type {account_type}: {str(e)}")
            raise

    def get_accounts_due(self, db: Session, due_date: str) -> List[AccountsPresent]:
        """Get accounts with specified due date.
        
        Args:
            db: Database session
            due_date: Due date to filter by
            
        Returns:
            List[AccountsPresent]: List of accounts with specified due date
        """
        logger.info(f"Fetching accounts with due date: {due_date}")
        try:
            return db.query(self.model).filter(
                self.model.NextDueDate == due_date
            ).all()
        except Exception as e:
            logger.error(f"Error fetching accounts with due date {due_date}: {str(e)}")
            raise

    def create(self, db: Session, *, obj_in: AccountCreate) -> AccountsPresent:
        """Create a new account.
        
        Args:
            db: Database session
            obj_in: Account creation data
            
        Returns:
            AccountsPresent: Created account
        """
        logger.info(f"Creating new account: {obj_in.AccountName}")
        try:
            return super().create(db, obj_in=obj_in)
        except Exception as e:
            logger.error(f"Error creating account {obj_in.AccountName}: {str(e)}")
            raise

    def update_balance(self, db: Session, *, cc_id: str, amount: Decimal) -> Optional[AccountsPresent]:
        """Update account balance by adding/subtracting amount.
        
        Args:
            db: Database session
            cc_id: Account CC ID (AccID)
            amount: Amount to adjust (positive for credit, negative for debit)
            
        Returns:
            Optional[AccountsPresent]: Updated account or None
        """
        logger.info(f"Adjusting balance for account {cc_id} by {amount}")
        try:
            account = self.get_by_cc_id(db, cc_id)
            if not account:
                logger.warning(f"Account with CC ID {cc_id} not found")
                return None
            
            new_balance = account.Balance + amount
            update_data = {"Balance": new_balance}
            return super().update(db, db_obj=account, obj_in=update_data)
        except Exception as e:
            logger.error(f"Error adjusting balance for account {cc_id}: {str(e)}")
            raise

account = CRUDAccount(AccountsPresent)
