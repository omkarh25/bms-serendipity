"""
Service for handling future payment operations.
Following Single Responsibility and Dependency Inversion principles.
"""
import logging
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.crud_future import crud_future
from app.models.models import FreedomFuture
from app.services.notification.base import NotificationProvider, NotificationMessage

logger = logging.getLogger(__name__)

class FuturePaymentService:
    """Service for managing future payments and their notifications."""
    
    def __init__(
        self,
        db: Session,
        notification_provider: Optional[NotificationProvider] = None
    ):
        """Initialize with database session and optional notification provider."""
        self.db = db
        self.crud = crud_future  # Use the pre-initialized crud_future instance
        self.notification_provider = notification_provider
    
    async def get_unpaid_payments(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[FreedomFuture]:
        """
        Get all unpaid payments within the specified date range.
        If no dates provided, returns all unpaid payments.
        """
        try:
            start_date = start_date or datetime.now().date()
            payments = self.crud.get_unpaid(
                db=self.db,
                start_date=start_date
            )
            logger.info(f"Retrieved {len(payments)} unpaid payments")
            return payments
            
        except Exception as e:
            logger.error(f"Error retrieving unpaid payments: {str(e)}")
            raise
    
    async def mark_payment_as_paid(self, tr_no: int) -> Optional[FreedomFuture]:
        """Mark a specific payment as paid."""
        try:
            payment = self.crud.mark_as_paid(
                db=self.db,
                id=tr_no
            )
            if payment:
                logger.info(f"Successfully marked payment {tr_no} as paid")
                await self._notify_payment_status(payment, is_paid=True)
            return payment
            
        except Exception as e:
            logger.error(f"Error marking payment {tr_no} as paid: {str(e)}")
            raise
    
    async def get_upcoming_payments(self, days_ahead: int = 7) -> List[FreedomFuture]:
        """Get payments due in the next specified number of days."""
        try:
            start_date = datetime.now().date()
            end_date = datetime.now().date().replace(
                day=start_date.day + days_ahead
            )
            
            payments = await self.get_unpaid_payments(
                start_date=start_date
            )
            
            logger.info(f"Retrieved {len(payments)} upcoming payments for next {days_ahead} days")
            return payments
            
        except Exception as e:
            logger.error(f"Error retrieving upcoming payments: {str(e)}")
            raise
    
    async def _notify_payment_status(
        self,
        payment: FreedomFuture,
        is_paid: bool = False
    ) -> None:
        """Send notification about payment status if notification provider exists."""
        if not self.notification_provider:
            return
            
        try:
            status = "paid" if is_paid else "due"
            message = (
                f"Payment {status}:\n"
                f"Transaction: {payment.TrNo}\n"
                f"Date: {payment.Date}\n"
                f"Amount: {payment.Amount}\n"
                f"Description: {payment.Description}"
            )
            
            notification = NotificationMessage(
                content=message,
                priority="high" if not is_paid else "normal",
                metadata={
                    "payment_id": payment.TrNo,
                    "status": status,
                    "amount": str(payment.Amount)
                }
            )
            
            await self.notification_provider.send_notification(
                notification.content,
                priority=notification.priority
            )
            
            logger.info(f"Sent notification for payment {payment.TrNo}")
            
        except Exception as e:
            logger.error(f"Failed to send payment notification: {str(e)}")
            # Don't raise the exception as this is a non-critical operation
    
    async def process_monthly_payments(self, month: int, year: int) -> List[FreedomFuture]:
        """Process all payments for a specific month and year."""
        try:
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            
            payments = await self.get_unpaid_payments(
                start_date=start_date
            )
            
            logger.info(f"Retrieved {len(payments)} payments for {month}/{year}")
            return payments
            
        except Exception as e:
            logger.error(f"Error processing monthly payments: {str(e)}")
            raise
