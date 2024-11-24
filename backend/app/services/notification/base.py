"""
Base notification service defining the interface for all notification providers.
Following Interface Segregation and Dependency Inversion principles.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from datetime import datetime

class NotificationProvider(ABC):
    """Abstract base class for notification providers."""
    
    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection to the notification service."""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from the notification service."""
        pass
    
    @abstractmethod
    async def send_notification(self, message: str, **kwargs: Dict[str, Any]) -> bool:
        """Send a notification through the provider."""
        pass
    
    @abstractmethod
    async def verify_connection(self) -> bool:
        """Verify if the connection is valid and active."""
        pass

class NotificationMessage:
    """Value object representing a notification message."""
    
    def __init__(
        self,
        content: str,
        timestamp: datetime = None,
        priority: str = "normal",
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.content = content
        self.timestamp = timestamp or datetime.now()
        self.priority = priority
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary format."""
        return {
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "priority": self.priority,
            "metadata": self.metadata
        }

class NotificationError(Exception):
    """Custom exception for notification-related errors."""
    pass
