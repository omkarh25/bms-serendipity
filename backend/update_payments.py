import os
import sqlite3
from datetime import datetime

# Get absolute path to the database
db_path = os.path.abspath('kaas.db')
print(f"Database path: {db_path}")

try:
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get payments from December 2024
    print("\nFinding payments to update...")
    cursor.execute("""
        SELECT TrNo, Date, Description, Amount, Paid
        FROM "Freedom(Future)"
        WHERE Date >= '2024-12-01' AND Date <= '2024-12-31'
        ORDER BY Date
        LIMIT 5
    """)
    payments = cursor.fetchall()
    
    # Print current state
    print("\nCurrent state:")
    for payment in payments:
        print(f"TrNo: {payment[0]}, Date: {payment[1]}, Description: {payment[2]}, Paid: {payment[4]}")
    
    # Update first 5 payments to be unpaid
    print("\nUpdating payments...")
    for payment in payments:
        trno = payment[0]
        cursor.execute("""
            UPDATE "Freedom(Future)"
            SET Paid = 0
            WHERE TrNo = ?
        """, (trno,))
        print(f"Updated TrNo: {trno}")
    
    # Commit changes
    conn.commit()
    print("\nChanges committed")
    
    # Verify updates
    print("\nVerifying updates...")
    cursor.execute("""
        SELECT TrNo, Date, Description, Amount, Paid
        FROM "Freedom(Future)"
        WHERE TrNo IN ({})
    """.format(','.join(str(p[0]) for p in payments)))
    
    updated_payments = cursor.fetchall()
    for payment in updated_payments:
        print(f"TrNo: {payment[0]}, Date: {payment[1]}, Description: {payment[2]}, Paid: {payment[4]}")

except Exception as e:
    print(f"\nError: {str(e)}")
    conn.rollback()
    raise
finally:
    conn.close()
