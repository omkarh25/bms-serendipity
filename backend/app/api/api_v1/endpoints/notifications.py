import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from telethon import TelegramClient
from datetime import datetime, date
from typing import List
import os

from app.api import deps
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Dummy data for testing
DUMMY_PAYMENTS = [
    {
        "Date": date(2024, 12, 2),
        "Description": "Test Payment 1",
        "Amount": 5000.00,
        "PaymentMode": "ICICI_Current",
        "Department": "Serendipity",
        "Category": "EMI",
        "Comments": "Test comment 1"
    },
    {
        "Date": date(2024, 12, 5),
        "Description": "Test Payment 2",
        "Amount": 10000.00,
        "PaymentMode": "SBI",
        "Department": "Serendipity",
        "Category": "Maintenance",
        "Comments": "Test comment 2"
    },
    {
        "Date": date(2024, 12, 10),
        "Description": "Test Payment 3",
        "Amount": 15000.00,
        "PaymentMode": "ICICI_Current",
        "Department": "Dhoom_Studios",
        "Category": "Salaries",
        "Comments": "Test comment 3"
    }
]

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

def format_payment_message(payment: dict) -> str:
    """Format payment details into a readable message."""
    return (
        f"🔔 Upcoming Payment Alert!\n\n"
        f"📅 Date: {payment['Date']}\n"
        f"📝 Description: {payment['Description']}\n"
        f"💰 Amount: ₹{payment['Amount']:,.2f}\n"
        f"💳 Payment Mode: {payment['PaymentMode']}\n"
        f"🏢 Department: {payment['Department']}\n"
        f"📋 Category: {payment['Category']}\n"
        f"💭 Comments: {payment['Comments'] or 'N/A'}"
    )

@router.post("/send-payment-notifications", response_model=dict)
async def send_payment_notifications(
    db: Session = Depends(deps.get_db)
) -> dict:
    """
    Send notifications for next 5 upcoming payments to Telegram channel.
    Currently using dummy data for testing.
    
    Returns:
        dict: Message indicating success or failure
    """
    client = None
    try:
        logger.info("Starting payment notification process...")
        
        # Initialize Telegram client
        client = await get_telegram_client()
        
        logger.info(f"Sending notifications for {len(DUMMY_PAYMENTS)} payments...")
        
        # Send notifications for each payment
        for i, payment in enumerate(DUMMY_PAYMENTS, 1):
            message = format_payment_message(payment)
            logger.debug(f"Sending notification {i}/{len(DUMMY_PAYMENTS)}")
            await client.send_message(
                settings.TELEGRAM_CHANNEL_ID,
                message
            )
            logger.debug(f"Notification {i} sent successfully")
        
        logger.info("All notifications sent successfully")
        return {
            "message": f"Successfully sent notifications for {len(DUMMY_PAYMENTS)} upcoming payments"
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
