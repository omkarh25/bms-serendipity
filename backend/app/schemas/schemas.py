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
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    payment_mode: Optional[PaymentMode] = None
    acc_id: Optional[str] = None
    department: Optional[Department] = None
    comments: Optional[str] = None
    category: Optional[Category] = None
    zoho_match: Optional[bool] = None

class Transaction(TransactionBase, BaseSchema):
    """Schema for transaction response."""
    TrNo: int  # Updated to match Excel column name

    class Config:
        orm_mode = True

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
    EmiAmt: Optional[Decimal] = None
    Comments: Optional[str] = None

class AccountCreate(AccountBase):
    """Schema for creating an account."""
    pass

class AccountUpdate(BaseModel):
    """Schema for updating an account."""
    account_name: Optional[str] = None
    type: Optional[AccountType] = None
    acc_id: Optional[str] = None
    balance: Optional[Decimal] = None
    int_rate: Optional[Decimal] = None
    next_due_date: Optional[str] = None
    bank: Optional[PaymentMode] = None
    tenure: Optional[int] = None
    emi_amt: Optional[Decimal] = None
    comments: Optional[str] = None

class Account(AccountBase, BaseSchema):
    """Schema for account response."""
    SLNo: int  # Updated to match Excel column name
    past_transactions: List[Transaction] = []
    future_transactions: List['FuturePrediction'] = []

    class Config:
        orm_mode = True

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
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    payment_mode: Optional[PaymentMode] = None
    acc_id: Optional[str] = None
    department: Optional[Department] = None
    comments: Optional[str] = None
    category: Optional[Category] = None
    paid: Optional[bool] = None

class FuturePrediction(FutureBase, BaseSchema):
    """Schema for future prediction response."""
    TrNo: int  # Updated to match Excel column name

    class Config:
        orm_mode = True

# Update Account model to include the forward reference
Account.update_forward_refs()
