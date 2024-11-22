from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date
from decimal import Decimal
from .base import BaseSchema
from app.models.models import PaymentMode, Department, Category, AccountType

class TransactionBase(BaseModel):
    """Base schema for transactions."""
    Date: date
    Description: str = Field(..., min_length=1)
    Amount: Decimal = Field(..., decimal_places=2)
    PaymentMode: PaymentMode
    AccID: str = Optional[str]  # Regex adapted to typical AccID structure
    Department: Department
    Comments: Optional[str] = None
    Category: Category
    ZohoMatch: Optional[bool] = False

class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass

class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    Date: Optional[date] = None
    Description: Optional[str] = None
    Amount: Optional[Decimal] = None
    PaymentMode: Optional[PaymentMode] = None
    AccID: Optional[str] = None
    Department: Optional[Department] = None
    Comments: Optional[str] = None
    Category: Optional[Category] = None
    ZohoMatch: Optional[bool] = None

class Transaction(TransactionBase, BaseSchema):
    """Schema for transaction response."""
    TrNo: int  # Updated to match Excel column name

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        alias_generator = lambda x: x  # Preserve original casing

class AccountBase(BaseModel):
    """Base schema for accounts."""
    AccountName: str = Field(..., min_length=1)
    Type: AccountType
    AccID: Optional[str]  # Updated for consistency with AccID
    Balance: Decimal = Field(..., decimal_places=2)
    IntRate: Optional[Decimal] = None
    NextDueDate: Optional[str] = None
    Bank: PaymentMode
    Tenure: Optional[int] = None
    EMIAmt: Optional[Decimal] = None
    Comments: Optional[str] = None

class AccountCreate(AccountBase):
    """Schema for creating an account."""
    pass

class AccountUpdate(BaseModel):
    """Schema for updating an account."""
    AccountName: Optional[str] = None
    Type: Optional[AccountType] = None
    AccID: Optional[str] = None
    Balance: Optional[Decimal] = None
    IntRate: Optional[Decimal] = None
    NextDueDate: Optional[str] = None
    Bank: Optional[PaymentMode] = None
    Tenure: Optional[int] = None
    EMIAmt: Optional[Decimal] = None
    Comments: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        alias_generator = lambda x: x  # Preserve original casing

class Account(AccountBase, BaseSchema):
    """Schema for account response."""
    SLNo: int  # Updated to match Excel column name
    past_transactions: List[Transaction] = []
    future_transactions: List['FuturePrediction'] = []

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        alias_generator = lambda x: x  # Preserve original casing

class FutureBase(BaseModel):
    """Base schema for future predictions."""
    Date: date
    Description: str = Field(..., min_length=1)
    Amount: Decimal = Field(..., decimal_places=2)
    PaymentMode: PaymentMode
    AccID: Optional[str]
    Department: Department
    Comments: Optional[str] = None
    Category: Category
    Paid: Optional[bool] = False

class FutureCreate(FutureBase):
    """Schema for creating a future prediction."""
    pass

class FutureUpdate(BaseModel):
    """Schema for updating a future prediction."""
    Date: Optional[date] = None
    Description: Optional[str] = None
    Amount: Optional[Decimal] = None
    PaymentMode: Optional[PaymentMode] = None
    AccID: Optional[str] = None
    Department: Optional[Department] = None
    Comments: Optional[str] = None
    Category: Optional[Category] = None
    Paid: Optional[bool] = None

    class Config:
        allow_population_by_field_name = True
        alias_generator = lambda x: x  # Preserve original casing

class FuturePrediction(FutureBase, BaseSchema):
    """Schema for future prediction response."""
    TrNo: int  # Updated to match Excel column name

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        alias_generator = lambda x: x  # Preserve original casing

# Update Account model to include the forward reference
Account.update_forward_refs()
