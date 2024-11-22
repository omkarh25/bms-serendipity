from typing import List
import logging
from sqlalchemy.orm import Session
from ..models.transaction import Transaction

logger = logging.getLogger(__name__)

class CRUDTransaction:
    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[Transaction]:
        logger.debug(f"Executing get_multi with skip={skip}, limit={limit}")
        try:
            result = db.query(Transaction).offset(skip).limit(limit).all()
            logger.debug(f"Successfully retrieved {len(result)} transactions")
            return result
        except Exception as e:
            logger.exception("Error in get_multi")
            raise

transaction = CRUDTransaction() 