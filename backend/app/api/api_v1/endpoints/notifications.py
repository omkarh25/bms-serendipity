import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from telethon import TelegramClient
from datetime import datetime, date, timedelta
from typing import List
import os

from app.api import deps
from app.core.config import settings
from app.crud.crud_future import crud_future

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

async def get_telegram_client():
    """Initialize and return Telegram client with credentials from env."""
    try:
        logger.info("Initializing Telegram client...")
        logger.debug(f"API ID: {settings.TELEGRAM_API_ID} (type: {type(settings.TELEGRAM_API_ID)})")
        logger.debug(f"Channel ID: {settings.TELEGRAM_CHANNEL_ID} (type: {type(settings.TELEGRAM_CHANNEL_ID)})")
        
        client = TelegramClient(
            'notification_sender',
            settings.TELEGRAM_API_ID,
            settings.TELEGRAM_API_HASH
        )
        
        logger.info("Connecting to Telegram...")
        await client.connect()
        
        if not await client.is_user_authorized():
            logger.warning("Telegram client not authorized")
            await client.send_code_request(settings.TELEGRAM_PHONE_NUMBER)
            raise HTTPException(
                status_code=500,
                detail="Telegram client not authorized. Please complete authorization process."
            )
        
        logger.info("Telegram client initialized successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Telegram client: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize Telegram client: {str(e)}"
        )

def format_payment_message(payment) -> str:
    """Format payment details into a readable message."""
    return (
        f"🔔 Upcoming Payment Alert!\n\n"
        f"📅 Date: {payment.Date}\n"
        f"📝 Description: {payment.Description}\n"
        f"💰 Amount: ₹{abs(payment.Amount):,.2f}\n"
        f"💳 Payment Mode: {payment.PaymentMode}\n"
        f"🏢 Department: {payment.Department}\n"
        f"📋 Category: {payment.Category}\n"
        f"💭 Comments: {payment.Comments or 'N/A'}"
    )

@router.post("/send-payment-notifications", response_model=dict)
async def send_payment_notifications(
    db: Session = Depends(deps.get_db)
) -> dict:
    """
    Send notifications for next 5 upcoming payments to Telegram channel.
    Fetches real data from the database.
    
    Returns:
        dict: Message indicating success or failure
    """
    client = None
    try:
        logger.info("=== Starting payment notification process ===")
        logger.debug(f"Database session ID: {id(db)}")
        logger.debug(f"Database session is active: {db.is_active}")
        
        # First verify database connection
        try:
            db.execute("SELECT 1")
            logger.debug("Database connection verified")
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Database connection failed"
            )
        
        # Get next 5 unpaid payments
        logger.debug("Fetching unpaid payments...")
        upcoming_payments = crud_future.get_unpaid(
            db,
            limit=5
        )
        
        # Debug log the found payments
        logger.debug(f"Found {len(upcoming_payments) if upcoming_payments else 0} upcoming payments")
        if upcoming_payments:
            for payment in upcoming_payments:
                logger.debug(
                    f"Payment details: "
                    f"TrNo={payment.TrNo}, "
                    f"Date={payment.Date}, "
                    f"Description={payment.Description}, "
                    f"Amount={payment.Amount}, "
                    f"Paid={payment.Paid}"
                )
        else:
            logger.debug("No payments returned from crud_future.get_unpaid")
        
        if not upcoming_payments:
            logger.warning("No upcoming payments found")
            return {"message": "No upcoming payments found for notification"}
        
        # Initialize Telegram client
        logger.debug("Initializing Telegram client...")
        client = await get_telegram_client()
        
        logger.info(f"Sending notifications for {len(upcoming_payments)} payments...")
        
        # Send notifications for each payment
        for i, payment in enumerate(upcoming_payments, 1):
            logger.debug(f"Processing payment {i}/{len(upcoming_payments)}")
            message = format_payment_message(payment)
            logger.debug(f"Formatted message for payment {i}:\n{message}")
            
            await client.send_message(
                settings.TELEGRAM_CHANNEL_ID,
                message
            )
            logger.debug(f"Notification {i} sent successfully")
        
        logger.info("All notifications sent successfully")
        return {
            "message": f"Successfully sent notifications for {len(upcoming_payments)} upcoming payments"
        }
            
    except Exception as e:
        logger.error(f"Failed to send notifications: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send notifications: {str(e)}"
        )
    finally:
        # Always disconnect the client
        if client:
            try:
                logger.info("Disconnecting Telegram client...")
                await client.disconnect()
                logger.info("Telegram client disconnected")
            except Exception as e:
                logger.error(f"Error disconnecting client: {str(e)}", exc_info=True)
