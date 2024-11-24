"""
Telegram-specific notification provider implementation.
Following Single Responsibility and Open/Closed principles.
"""
import logging
from typing import Any, Dict, Optional
from telethon import TelegramClient
from app.core.config import settings
from .base import NotificationProvider, NotificationError, NotificationMessage

logger = logging.getLogger(__name__)

class TelegramNotificationProvider(NotificationProvider):
    """Telegram notification provider implementation."""
    
    def __init__(self):
        """Initialize Telegram client with configuration."""
        self.client: Optional[TelegramClient] = None
        self.session_name = 'notification_sender'
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize the Telegram client with API credentials."""
        try:
            self.client = TelegramClient(
                self.session_name,
                settings.TELEGRAM_API_ID,
                settings.TELEGRAM_API_HASH
            )
        except Exception as e:
            logger.error(f"Failed to initialize Telegram client: {str(e)}")
            raise NotificationError(f"Telegram client initialization failed: {str(e)}")
    
    async def connect(self) -> bool:
        """Establish connection to Telegram."""
        try:
            if not self.client:
                self._initialize_client()
            
            await self.client.connect()
            if not await self.client.is_user_authorized():
                logger.error("Telegram client not authorized")
                return False
            
            logger.info("Successfully connected to Telegram")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Telegram: {str(e)}")
            raise NotificationError(f"Telegram connection failed: {str(e)}")
    
    async def disconnect(self) -> None:
        """Disconnect from Telegram."""
        try:
            if self.client:
                await self.client.disconnect()
                logger.info("Disconnected from Telegram")
        except Exception as e:
            logger.error(f"Error disconnecting from Telegram: {str(e)}")
    
    async def verify_connection(self) -> bool:
        """Verify if the Telegram connection is valid."""
        try:
            if not self.client:
                return False
            return await self.client.is_user_authorized()
        except Exception:
            return False
    
    async def send_notification(self, message: str, **kwargs: Dict[str, Any]) -> bool:
        """Send a notification through Telegram."""
        try:
            if not await self.verify_connection():
                await self.connect()
            
            notification = NotificationMessage(
                content=message,
                priority=kwargs.get('priority', 'normal'),
                metadata=kwargs
            )
            
            # Send message to specified chat/user
            chat_id = kwargs.get('chat_id', settings.TELEGRAM_CHAT_ID)
            await self.client.send_message(
                chat_id,
                notification.content,
                parse_mode=kwargs.get('parse_mode', 'markdown')
            )
            
            logger.info(f"Successfully sent notification to chat {chat_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send Telegram notification: {str(e)}")
            raise NotificationError(f"Failed to send notification: {str(e)}")
    
    async def authorize(self, phone_number: str, code: str) -> bool:
        """
        Authorize the Telegram client with a phone number and verification code.
        This should be called only once to create the session file.
        """
        try:
            if not self.client:
                self._initialize_client()
            
            await self.client.connect()
            
            if not await self.client.is_user_authorized():
                await self.client.sign_in(phone_number, code)
                logger.info("Successfully authorized Telegram client")
                return True
                
            logger.info("Client already authorized")
            return True
            
        except Exception as e:
            logger.error(f"Failed to authorize Telegram client: {str(e)}")
            raise NotificationError(f"Authorization failed: {str(e)}")
