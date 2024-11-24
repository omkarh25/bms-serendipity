"""
CLI commands module providing command-line interfaces to core functionality.
Following Single Responsibility and Dependency Injection principles.
"""
import asyncio
import logging
import typer
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.notification.telegram import TelegramNotificationProvider
from app.services.payment.future_payment_service import FuturePaymentService

app = typer.Typer()
logger = logging.getLogger(__name__)

def get_db() -> Session:
    """Get database session."""
    return SessionLocal()

@app.command()
def authorize_telegram(
    phone_number: str = typer.Option(..., prompt=True),
    verification_code: str = typer.Option(..., prompt=True)
):
    """
    Authorize Telegram client with phone number and verification code.
    This should be run once to create the session file.
    """
    async def _authorize():
        provider = TelegramNotificationProvider()
        try:
            success = await provider.authorize(
                phone_number=phone_number,
                code=verification_code
            )
            if success:
                typer.echo("Successfully authorized Telegram client")
            else:
                typer.echo("Failed to authorize Telegram client", err=True)
        except Exception as e:
            typer.echo(f"Error during authorization: {str(e)}", err=True)
        finally:
            await provider.disconnect()
    
    asyncio.run(_authorize())

@app.command()
def check_future_payments(
    days_ahead: int = typer.Option(7, help="Number of days to look ahead"),
    send_notifications: bool = typer.Option(
        False,
        help="Send notifications for upcoming payments"
    )
):
    """Check upcoming future payments and optionally send notifications."""
    async def _check_payments():
        db = get_db()
        try:
            notification_provider = None
            if send_notifications:
                notification_provider = TelegramNotificationProvider()
                if not await notification_provider.connect():
                    typer.echo("Warning: Could not connect to notification service", err=True)
                    notification_provider = None
            
            payment_service = FuturePaymentService(
                db=db,
                notification_provider=notification_provider
            )
            
            payments = await payment_service.get_upcoming_payments(days_ahead=days_ahead)
            
            if not payments:
                typer.echo("No upcoming payments found")
                return
            
            typer.echo(f"\nFound {len(payments)} upcoming payments:")
            for payment in payments:
                typer.echo(
                    f"\nTransaction: {payment.TrNo}"
                    f"\nDate: {payment.Date}"
                    f"\nAmount: {payment.Amount}"
                    f"\nDescription: {payment.Description}"
                    f"\n{'-' * 40}"
                )
                
        except Exception as e:
            typer.echo(f"Error checking payments: {str(e)}", err=True)
        finally:
            db.close()
            if notification_provider:
                await notification_provider.disconnect()
    
    asyncio.run(_check_payments())

@app.command()
def update_monthly_payments(
    month: int = typer.Option(..., min=1, max=12),
    year: int = typer.Option(..., min=2000, max=9999),
    mark_paid: bool = typer.Option(
        False,
        help="Mark all payments for the month as paid"
    )
):
    """Process payments for a specific month and year."""
    async def _update_payments():
        db = get_db()
        try:
            payment_service = FuturePaymentService(db=db)
            payments = await payment_service.process_monthly_payments(
                month=month,
                year=year
            )
            
            if not payments:
                typer.echo(f"No payments found for {month}/{year}")
                return
            
            typer.echo(f"\nFound {len(payments)} payments for {month}/{year}:")
            for payment in payments:
                status = "Marking as paid..." if mark_paid else "Unpaid"
                typer.echo(
                    f"\nTransaction: {payment.TrNo}"
                    f"\nDate: {payment.Date}"
                    f"\nAmount: {payment.Amount}"
                    f"\nStatus: {status}"
                    f"\n{'-' * 40}"
                )
                
                if mark_paid:
                    await payment_service.mark_payment_as_paid(payment.TrNo)
            
            if mark_paid:
                typer.echo(f"\nMarked {len(payments)} payments as paid")
                
        except Exception as e:
            typer.echo(f"Error updating payments: {str(e)}", err=True)
        finally:
            db.close()
    
    asyncio.run(_update_payments())

@app.command()
def verify_notification_service():
    """Verify if the notification service is properly configured and connected."""
    async def _verify():
        provider = TelegramNotificationProvider()
        try:
            if await provider.verify_connection():
                typer.echo("Notification service is properly configured and connected")
            else:
                typer.echo("Notification service is not properly configured", err=True)
        except Exception as e:
            typer.echo(f"Error verifying notification service: {str(e)}", err=True)
        finally:
            await provider.disconnect()
    
    asyncio.run(_verify())

if __name__ == "__main__":
    app()
