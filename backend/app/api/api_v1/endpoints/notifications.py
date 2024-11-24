"""
API endpoints for handling notifications.
Following Single Responsibility and Dependency Injection principles.
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.services.notification.telegram import TelegramNotificationProvider
from app.services.payment.future_payment_service import FuturePaymentService
from app.schemas.schemas import FuturePrediction

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_notification_provider() -> TelegramNotificationProvider:
    """Dependency to get configured notification provider."""
    provider = TelegramNotificationProvider()
    try:
        if not await provider.verify_connection():
            if not await provider.connect():
                raise HTTPException(
                    status_code=503,
                    detail="Failed to connect to notification service"
                )
        return provider
    except Exception as e:
        logger.error(f"Error initializing notification provider: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Notification service unavailable"
        )

@router.post("/send-payment-notifications", response_model=List[FuturePrediction])
async def send_payment_notifications(
    days_ahead: int = 7,
    db: Session = Depends(deps.get_db),
    notification_provider: TelegramNotificationProvider = Depends(get_notification_provider)
) -> List[FuturePrediction]:
    """
    Send notifications for upcoming payments in the next specified days.
    Returns the list of payments that were notified about.
    """
    try:
        # Initialize the payment service with notification provider
        payment_service = FuturePaymentService(
            db=db,
            notification_provider=notification_provider
        )
        
        # Get upcoming payments and send notifications
        upcoming_payments = await payment_service.get_upcoming_payments(
            days_ahead=days_ahead
        )
        
        logger.info(f"Successfully sent notifications for {len(upcoming_payments)} payments")
        return upcoming_payments
        
    except Exception as e:
        logger.error(f"Error sending payment notifications: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send payment notifications: {str(e)}"
        )
    finally:
        # Ensure we disconnect from the notification service
        await notification_provider.disconnect()

@router.post("/authorize-telegram")
async def authorize_telegram(
    phone_number: str,
    verification_code: str,
    notification_provider: TelegramNotificationProvider = Depends(get_notification_provider)
) -> dict:
    """
    Authorize Telegram client with phone number and verification code.
    This should be called only once to create the session file.
    """
    try:
        success = await notification_provider.authorize(
            phone_number=phone_number,
            code=verification_code
        )
        
        if success:
            return {"status": "success", "message": "Telegram client authorized successfully"}
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to authorize Telegram client"
            )
            
    except Exception as e:
        logger.error(f"Error authorizing Telegram client: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Authorization failed: {str(e)}"
        )
    finally:
        await notification_provider.disconnect()

@router.get("/verify-notification-service")
async def verify_notification_service(
    notification_provider: TelegramNotificationProvider = Depends(get_notification_provider)
) -> dict:
    """Verify if the notification service is properly configured and connected."""
    try:
        is_connected = await notification_provider.verify_connection()
        return {
            "status": "connected" if is_connected else "disconnected",
            "service": "telegram"
        }
    except Exception as e:
        logger.error(f"Error verifying notification service: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify notification service: {str(e)}"
        )
    finally:
        await notification_provider.disconnect()
