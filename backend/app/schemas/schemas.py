"""Pydantic models for API request/response handling."""

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

class PaymentMode(str, Enum):
    Cash = "Cash"
    Credit = "Credit"
    Dollars = "Dollars"
    ICICI_090 = "ICICI_090"
    ICICI_Current = "ICICI_Current"
    ICICI_CC_9003 = "ICICI_CC_9003"
    ICICI_CC_1009 = "ICICI_CC_1009"
    SBI = "SBI"
    SBI_3479 = "SBI_3479"
    DBS = "DBS"
    Debit = "Debit"

class Department(str, Enum):
    Serendipity = "Serendipity"
    Dhoom_Studios = "Dhoom Studios"
    Trademan = "Trademan"

class Category(str, Enum):
    Salaries = "Salaries"
    Hand_Loans = "Hand Loans"
    Maintenance = "Maintenance"
    Income = "Income"
    EMI = "EMI"
    Chits = "Chits"

class AccountType(str, Enum):
    HL = "HL"
    EMI = "EMI"
    HLG = "HLG"
    CC = "CC"
    CAS = "CAS"
    Chit = "Chit"
    CON = "CON"
    ACC = "ACC"

# Transaction schemas
class TransactionBase(BaseModel):
    Date: date
    Description: str
    Amount: Decimal
    PaymentMode: PaymentMode
    AccID: str
    Department: Department
    Comments: Optional[str] = None
    Category: Category
    ZohoMatch: bool = False

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    Date: Optional[date] = None
    Description: Optional[str] = None
    Amount: Optional[Decimal] = None
    PaymentMode: Optional[PaymentMode] = None
    AccID: Optional[str] = None
    Department: Optional[Department] = None
    Comments: Optional[str] = None
    Category: Optional[Category] = None
    ZohoMatch: Optional[bool] = None

class Transaction(TransactionBase):
    TrNo: int

    class Config:
        from_attributes = True

# Account schemas
class AccountBase(BaseModel):
    AccountName: str
    Type: AccountType
    AccID: str
    Balance: Decimal
    IntRate: Decimal
    NextDueDate: str
    Bank: PaymentMode
    Tenure: Optional[int] = None
    EMIAmt: Optional[Decimal] = None
    Comments: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    AccountName: Optional[str] = None
    Type: Optional[AccountType] = None
    Balance: Optional[Decimal] = None
    IntRate: Optional[Decimal] = None
    NextDueDate: Optional[str] = None
    Bank: Optional[PaymentMode] = None
    Tenure: Optional[int] = None
    EMIAmt: Optional[Decimal] = None
    Comments: Optional[str] = None

class Account(AccountBase):
    SLNo: int

    class Config:
        from_attributes = True

# Future prediction schemas
class FuturePredictionBase(BaseModel):
    Date: date
    Description: str
    Amount: Decimal
    PaymentMode: PaymentMode
    AccID: str
    Department: Department
    Comments: Optional[str] = None
    Category: Category
    Paid: bool = False

class FuturePredictionCreate(FuturePredictionBase):
    pass

class FuturePredictionUpdate(BaseModel):
    Date: Optional[date] = None
    Description: Optional[str] = None
    Amount: Optional[Decimal] = None
    PaymentMode: Optional[PaymentMode] = None
    AccID: Optional[str] = None
    Department: Optional[Department] = None
    Comments: Optional[str] = None
    Category: Optional[Category] = None
    Paid: Optional[bool] = None

class FuturePrediction(FuturePredictionBase):
    TrNo: int

    class Config:
        from_attributes = True

# Aliases for backward compatibility
FutureCreate = FuturePredictionCreate
FutureUpdate = FuturePredictionUpdate
Future = FuturePrediction

# ICICI Bank Transaction schemas
class ICICITransactionBase(BaseModel):
    """Base schema for ICICI bank transactions."""
    transaction_date: date = Field(..., description="Date of transaction")
    value_date: date = Field(..., description="Value date of transaction")
    description: str = Field(..., description="Transaction description")
    ref_no: str = Field(..., description="Reference number")
    debit: Optional[Decimal] = Field(None, description="Debit amount")
    credit: Optional[Decimal] = Field(None, description="Credit amount")
    balance: Decimal = Field(..., description="Running balance")
    reconciled: bool = Field(False, description="Whether transaction is reconciled")
    transaction_id: Optional[int] = Field(None, description="Reference to main transaction if reconciled")

class ICICITransactionCreate(ICICITransactionBase):
    pass

class ICICITransactionUpdate(BaseModel):
    reconciled: Optional[bool] = None
    transaction_id: Optional[int] = None

class ICICITransaction(ICICITransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Response schemas for bank statement upload and reconciliation
class BankStatementUploadResponse(BaseModel):
    """Response schema for bank statement upload."""
    total_transactions: int = Field(..., description="Total number of transactions in the statement")
    new_transactions: int = Field(..., description="Number of new transactions added")
    duplicate_transactions: int = Field(..., description="Number of duplicate transactions skipped")
    message: str = Field(..., description="Status message")

class ReconciliationResponse(BaseModel):
    """Response schema for reconciliation operation."""
    total_transactions: int = Field(..., description="Total number of transactions processed")
    reconciled_transactions: int = Field(..., description="Number of transactions reconciled")
    unreconciled_transactions: int = Field(..., description="Number of transactions that couldn't be reconciled")
    message: str = Field(..., description="Status message")
