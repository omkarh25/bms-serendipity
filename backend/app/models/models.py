from sqlalchemy import Column, Integer, String, Date, Numeric, Boolean, ForeignKey, Enum, DateTime
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class PaymentMode(str, enum.Enum):
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
    

class Department(str, enum.Enum):
    """Enum for departments."""
    Serendipity = "Serendipity"
    Dhoom_Studios = "Dhoom Studios"
    Trademan = "Trademan"

    @classmethod
    def _missing_(cls, value):
        # Normalize the input value by removing spaces and converting to uppercase
        normalized_value = str(value).replace(" ", "_").upper()
        for member in cls:
            # Normalize the member value for comparison
            normalized_member = member.value.replace(" ", "_").upper()
            if normalized_value == normalized_member:
                return member
            # Also try matching against the enum name
            if normalized_value == member.name:
                return member
        return None

class Category(str, enum.Enum):
    Salaries = "Salaries"
    Hand_Loans = "Hand Loans"
    Maintenance = "Maintenance"
    Income = "Income"
    EMI = "EMI"
    Chits = "Chits"

class AccountType(str, enum.Enum):
    HL = "HL"
    EMI = "EMI"
    HLG = "HLG"
    CC = "CC"
    CAS = "CAS"
    Chit = "Chit"
    CON = "CON"
    ACC = "ACC"

class TransactionsPast(Base):
    __tablename__ = "Transactions(Past)"
    
    TrNo = Column(Integer, primary_key=True, autoincrement=True, doc="Serial number of transaction")
    Date = Column(Date, nullable=False, doc="Date of creation")
    Description = Column(String, nullable=False, doc="Description of the transaction")
    Amount = Column(Numeric(10, 2), nullable=False, doc="Amount of the transaction")
    PaymentMode = Column(Enum(PaymentMode), nullable=False, doc="Mode of payment")
    AccID = Column(String, nullable=False, doc="Account ID for transaction categorization")
    Department = Column(Enum(Department), nullable=False, doc="Internal department names")
    Comments = Column(String, nullable=True, doc="Detailed descriptions of the Income and Expense")
    Category = Column(Enum(Category), nullable=False, doc="Transaction category type")
    ZohoMatch = Column(Boolean, nullable=False, doc="If transactions are matched with Zoho while categorization")

    def __repr__(self):
        return f"<TransactionsPast(TrNo={self.TrNo}, Date={self.Date}, Amount={self.Amount}, Department={self.Department})>"

class AccountsPresent(Base):
    __tablename__ = "Accounts(Present)"
    
    SLNo = Column(Integer, primary_key=True, autoincrement=True, doc="Serial number of account")
    AccountName = Column(String, nullable=False, doc="Name of the Account")
    Type = Column(Enum(AccountType), nullable=False, doc="Type of account with short ID")
    AccID = Column(String, unique=True, nullable=False, doc="Account ID for categorization")
    Balance = Column(Numeric(10, 2), nullable=False, doc="Current Balance of the account")
    IntRate = Column(Numeric(5, 2), nullable=False, doc="Monthly Interest rate for the account")
    NextDueDate = Column(String, nullable=False, doc="Monthly specified date for paying EMI or Interest")
    Bank = Column(Enum(PaymentMode), nullable=False, doc="Bank where transactions are made")
    Tenure = Column(Integer, nullable=True, doc="Total Number of Months for loans")
    EMIAmt = Column(Numeric(10, 2), nullable=True, doc="Monthly Estimated Installment or Interest amount")
    Comments = Column(String, nullable=True, doc="Detailed descriptions of the Account")

    def __repr__(self):
        return f"<AccountsPresent(SLNo={self.SLNo}, AccountName={self.AccountName}, Balance={self.Balance})>"

class FreedomFuture(Base):
    __tablename__ = "Freedom(Future)"
    
    TrNo = Column(Integer, primary_key=True, autoincrement=True, doc="Serial number")
    Date = Column(Date, nullable=False, doc="Date of creation")
    Description = Column(String, nullable=False, doc="Description of forecasted transaction")
    Amount = Column(Numeric(10, 2), nullable=False, doc="Amount of forecasted transaction")
    PaymentMode = Column(Enum(PaymentMode), nullable=False, doc="Forecasted payment mode")
    AccID = Column(String, nullable=False, doc="Account ID for forecasted transaction")
    Department = Column(Enum(Department), nullable=False, doc="Internal department names")
    Comments = Column(String, nullable=True, doc="Detailed descriptions of forecasted transaction")
    Category = Column(Enum(Category), nullable=False, doc="Transaction category type")
    Paid = Column(Boolean, nullable=False, default=False, doc="Indicates if forecasted transaction is paid")

    def __repr__(self):
        return f"<FreedomFuture(TrNo={self.TrNo}, Date={self.Date}, Amount={self.Amount}, Paid={self.Paid})>"
