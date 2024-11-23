import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import FreedomFuture
from datetime import datetime

# Get absolute path to the database
db_path = os.path.abspath('kaas.db')
print(f"Database path: {db_path}")

# Create engine with correct path
engine = create_engine(f'sqlite:///{db_path}', echo=True)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # Get all unpaid payments
    print("\nQuerying all unpaid payments...")
    unpaid_payments = session.query(FreedomFuture).filter(
        FreedomFuture.Paid == False
    ).order_by(FreedomFuture.Date).all()

    print(f"\nFound {len(unpaid_payments)} unpaid payments")
    for payment in unpaid_payments:
        print(f"\nPayment Details:")
        print(f"TrNo: {payment.TrNo}")
        print(f"Date: {payment.Date} (Type: {type(payment.Date)})")
        print(f"Description: {payment.Description}")
        print(f"Amount: {payment.Amount}")
        print(f"PaymentMode: {payment.PaymentMode}")
        print(f"Department: {payment.Department}")
        print(f"Category: {payment.Category}")
        print(f"Paid: {payment.Paid}")

    # Get future payments from today
    print("\nQuerying payments from today onwards...")
    today = datetime.now().date()
    print(f"Today's date: {today}")
    
    future_payments = session.query(FreedomFuture).filter(
        FreedomFuture.Paid == False,
        FreedomFuture.Date >= today
    ).order_by(FreedomFuture.Date).all()

    print(f"\nFound {len(future_payments)} future payments")
    for payment in future_payments:
        print(f"\nFuture Payment Details:")
        print(f"TrNo: {payment.TrNo}")
        print(f"Date: {payment.Date} (Type: {type(payment.Date)})")
        print(f"Description: {payment.Description}")
        print(f"Amount: {payment.Amount}")
        print(f"PaymentMode: {payment.PaymentMode}")
        print(f"Department: {payment.Department}")
        print(f"Category: {payment.Category}")
        print(f"Paid: {payment.Paid}")

finally:
    session.close()
