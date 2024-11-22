"""Base Pydantic models for common fields and configurations."""

from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class BaseSchema(BaseModel):
    """Base schema with common fields."""
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        json_encoders = {
            datetime: lambda v: v.strftime("%Y-%m-%d %H:%M:%S")
        }

    @validator('created_at', 'updated_at', pre=True)
    def parse_datetime(cls, value):
        """Parse datetime fields."""
        if isinstance(value, str):
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        return value
