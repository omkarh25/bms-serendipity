from typing import List
import logging
from sqlalchemy.orm import Session
from ..models.models import TransactionsPast as Transaction
from .base import CRUDBase
from app.schemas.schemas import TransactionCreate, TransactionUpdate

logger = logging.getLogger(__name__)

class CRUDTransaction(CRUDBase[Transaction, TransactionCreate, TransactionUpdate]):
    """
    CRUD operations for Transactions
    """
    def __init__(self):
        super().__init__(Transaction)

    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """
        Retrieve multiple transactions with pagination
        
        Args:
            db (Session): Database session
            skip (int): Number of records to skip
            limit (int): Maximum number of records to return
            
        Returns:
            List[Transaction]: List of transaction records
            
        Raises:
            Exception: If database query fails
        """
        logger.debug(f"Executing get_multi with skip={skip}, limit={limit}")
        try:
            result = db.query(Transaction).offset(skip).limit(limit).all()
            logger.debug(f"Successfully retrieved {len(result)} transactions")
            return result
        except Exception as e:
            logger.exception("Error in get_multi")
            raise

    def get_by_category(
        self,
        db: Session,
        category: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """
        Retrieve transactions by category
        
        Args:
            db (Session): Database session
            category (str): Category to filter by
            skip (int): Number of records to skip
            limit (int): Maximum number of records to return
            
        Returns:
            List[Transaction]: List of transaction records
        """
        return db.query(Transaction).filter(
            Transaction.category == category
        ).offset(skip).limit(limit).all()

    def get_by_department(
        self,
        db: Session,
        department: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        """
        Retrieve transactions by department
        
        Args:
            db (Session): Database session
            department (str): Department to filter by
            skip (int): Number of records to skip
            limit (int): Maximum number of records to return
            
        Returns:
            List[Transaction]: List of transaction records
        """
        return db.query(Transaction).filter(
            Transaction.department == department
        ).offset(skip).limit(limit).all()

    def get_by_sl_no(self, db: Session, sl_no: int) -> Transaction:
        """
        Retrieve transaction by serial number
        
        Args:
            db (Session): Database session
            sl_no (int): Serial number to find
            
        Returns:
            Transaction: Transaction record
        """
        return db.query(Transaction).filter(Transaction.sl_no == sl_no).first()

    def get_by_date_range(
        self,
        db: Session,
        start_date: str,
        end_date: str
    ) -> List[Transaction]:
        """
        Retrieve transactions within a date range
        
        Args:
            db (Session): Database session
            start_date (str): Start date
            end_date (str): End date
            
        Returns:
            List[Transaction]: List of transaction records
        """
        return db.query(Transaction).filter(
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).all()

transaction = CRUDTransaction()
