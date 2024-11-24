"""
CRUD operations for Future Predictions
"""

from datetime import date, datetime
from typing import Any, Dict, List, Optional
import logging

from app.crud.base import CRUDBase
from app.models.models import FreedomFuture
from app.schemas.schemas import FuturePredictionCreate as FutureCreate, FuturePredictionUpdate as FutureUpdate
from sqlalchemy import and_, desc, cast, Date, func, text
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class CRUDFuture(CRUDBase[FreedomFuture, FutureCreate, FutureUpdate]):
    """
    CRUD operations for Future Predictions

    Extends the base CRUD class with specific operations for future predictions
    """

    def get_unpaid(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: Optional[int] = None,
        start_date: Optional[date] = None
    ) -> List[FreedomFuture]:
        """
        Get unpaid future predictions

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            start_date: Optional start date to filter from

        Returns:
            List of unpaid future predictions
        """
        try:
            logger.debug("Starting get_unpaid operation")
            logger.debug(f"Session ID: {id(db)}")
            logger.debug(f"Session is active: {db.is_active}")
            
            # First verify the database connection
            try:
                db.execute(text("SELECT 1"))
                logger.debug("Database connection verified")
            except Exception as e:
                logger.error(f"Database connection test failed: {str(e)}")
                raise

            # Start with base query
            query = db.query(self.model)
            logger.debug(f"Base query created: {str(query)}")
            
            # Filter for unpaid records
            query = query.filter(self.model.Paid == 'false')
            logger.debug(f"Added Paid filter: {str(query)}")
            
            # Apply ordering
            query = query.order_by(self.model.Date)
            logger.debug(f"Added ordering: {str(query)}")
            
            # Apply limit
            if limit:
                query = query.limit(limit)
                logger.debug(f"Added limit {limit}: {str(query)}")

            # Execute query and get results
            logger.debug("Executing query...")
            results = query.all()
            logger.debug(f"Query executed, found {len(results)} results")
            
            # Log each result
            for result in results:
                logger.debug(
                    f"Result: TrNo={result.TrNo}, "
                    f"Date={result.Date}, "
                    f"Description={result.Description}, "
                    f"Amount={result.Amount}, "
                    f"Paid={result.Paid}"
                )

            # Verify result types
            if results:
                first_result = results[0]
                logger.debug(f"First result type: {type(first_result)}")
                logger.debug(f"First result dict: {first_result.__dict__}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in get_unpaid: {str(e)}", exc_info=True)
            raise

    def mark_as_paid(
        self, db: Session, *, id: int, paid: bool = True
    ) -> Optional[FreedomFuture]:
        """
        Mark a future prediction as paid/unpaid

        Args:
            db: Database session
            id: ID of the future prediction
            paid: Paid status to set

        Returns:
            Updated future prediction or None if not found
        """
        obj = db.query(self.model).filter(self.model.TrNo == id).first()
        if obj:
            # Convert boolean to string for BooleanStr type
            obj.Paid = str(paid).lower()
            db.commit()
            db.refresh(obj)
        return obj


crud_future = CRUDFuture(FreedomFuture)
