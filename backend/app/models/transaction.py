from sqlalchemy import Column, Integer, String, Float, DateTime
from app.models.models import Base

class Transaction(Base):
    __tablename__ = "Transactions(Past)"
    __table_args__ = {'extend_existing': True}

    TrNo = Column(Integer, primary_key=True, index=True)
    Date = Column(DateTime)
    Description = Column(String)
    Amount = Column(Float)
    PaymentMode = Column(String)
    AccID = Column(String)
    Department = Column(String)
    Comments = Column(String)
    Category = Column(String)
    ZohoMatch = Column(String) 