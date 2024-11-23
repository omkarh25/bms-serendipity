"""
CRUD operations for Future Predictions
"""

from datetime import date
from typing import Any, Dict, List, Optional

from app.crud.base import CRUDBase
from app.models.models import FreedomFuture
from app.schemas.schemas import FutureCreate, FutureUpdate
from sqlalchemy import and_, desc
from sqlalchemy.orm import Session


class CRUDFuture(CRUDBase[FreedomFuture, FutureCreate, FutureUpdate]):
    """
    CRUD operations for Future Predictions

    Extends the base CRUD class with specific operations for future predictions
    """

    def get_multi(
        self,
        db: Session,
        *,
        filters: Optional[List[Dict[str, Any]]] = None,
        order_by: Optional[str] = None,
        skip: int = 0,
        limit: Optional[int] = None
    ) -> List[FreedomFuture]:
        """
        Get multiple future predictions with optional filtering and ordering

        Args:
            db: Database session
            filters: List of filter conditions [{"field": str, "op": str, "value": Any}]
            order_by: Field to order by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of future predictions matching the criteria
        """
        query = db.query(self.model)

        # Apply filters if provided
        if filters:
            filter_conditions = []
            for filter_dict in filters:
                field = getattr(self.model, filter_dict["field"])
                op = filter_dict["op"]
                value = filter_dict["value"]

                if op == "==":
                    filter_conditions.append(field == value)
                elif op == "!=":
                    filter_conditions.append(field != value)
                elif op == ">":
                    filter_conditions.append(field > value)
                elif op == ">=":
                    filter_conditions.append(field >= value)
                elif op == "<":
                    filter_conditions.append(field < value)
                elif op == "<=":
                    filter_conditions.append(field <= value)

            if filter_conditions:
                query = query.filter(and_(*filter_conditions))

        # Apply ordering if provided
        if order_by:
            if order_by.startswith("-"):
                query = query.order_by(desc(getattr(self.model, order_by[1:])))
            else:
                query = query.order_by(getattr(self.model, order_by))

        # Apply pagination
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)

        return query.all()

    def get_by_date_range(
        self,
        db: Session,
        *,
        start_date: date,
        end_date: date,
        paid: Optional[bool] = None
    ) -> List[FreedomFuture]:
        """
        Get future predictions within a date range

        Args:
            db: Database session
            start_date: Start date of range
            end_date: End date of range
            paid: Optional filter for paid status

        Returns:
            List of future predictions within the date range
        """
        query = db.query(self.model).filter(
            and_(self.model.Date >= start_date, self.model.Date <= end_date)
        )

        if paid is not None:
            query = query.filter(self.model.Paid == paid)

        return query.order_by(self.model.Date).all()

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
        # Start with base query
        query = db.query(self.model)
        
        # Filter for unpaid records
        query = query.filter(self.model.Paid == False)

        if start_date:
            query = query.filter(self.model.Date >= start_date)
        
        # Apply ordering first
        query = query.order_by(self.model.Date)
        
        # Then apply pagination
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)

        return query.all()

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
            obj.Paid = paid
            db.commit()
            db.refresh(obj)
        return obj


crud_future = CRUDFuture(FreedomFuture)
