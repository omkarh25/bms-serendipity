from datetime import datetime
from pydantic import BaseModel, field_validator, model_validator
from typing import Optional

class TransactionBase(BaseModel):
    Date: datetime

    @field_validator('Date')
    def parse_date(cls, value):
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace(' ', 'T'))
            except ValueError:
                try:
                    return datetime.strptime(value, '%Y-%m-%d %H:%M:%S.%f')
                except ValueError:
                    return datetime.strptime(value, '%Y-%m-%d')
        return value

    class Config:
        from_attributes = True

class TransactionCreate(TransactionBase):
    Description: str
    Amount: float
    PaymentMode: str
    AccID: str
    Department: Optional[str] = None
    Comments: Optional[str] = None
    Category: str  # Changed to str to handle both formats
    ZohoMatch: Optional[str] = None

class TransactionUpdate(TransactionBase):
    Description: Optional[str] = None
    Amount: Optional[float] = None
    PaymentMode: Optional[str] = None
    AccID: Optional[str] = None
    Department: Optional[str] = None
    Comments: Optional[str] = None
    Category: Optional[str] = None
    ZohoMatch: Optional[str] = None

class Transaction(TransactionCreate):
    TrNo: int

    @model_validator(mode='before')
    @classmethod
    def validate_category(cls, values):
        if isinstance(values, dict) and 'Category' in values:
            # Convert Hand_Loans to Hand Loans in the response
            if values['Category'] == 'Hand_Loans':
                values['Category'] = 'Hand Loans'
        return values

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }