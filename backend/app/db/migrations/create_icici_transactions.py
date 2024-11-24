"""Migration script to create ICICI_Savings_Transactions table."""

import sqlite3
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def create_icici_transactions_table():
    """Create ICICI_Savings_Transactions table if it doesn't exist."""
    try:
        # Get the path to kaas.db
        db_path = Path(__file__).parent.parent.parent.parent / 'kaas.db'
        
        # Connect to database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Create table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ICICI_Savings_Transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_date DATE NOT NULL,
            value_date DATE NOT NULL,
            description TEXT NOT NULL,
            ref_no TEXT NOT NULL,
            debit DECIMAL(10, 2),
            credit DECIMAL(10, 2),
            balance DECIMAL(10, 2) NOT NULL,
            reconciled BOOLEAN DEFAULT FALSE,
            transaction_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transaction_id) REFERENCES "Transactions(Past)" (TrNo)
        )
        """)
        
        # Create index on ref_no for faster lookups
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_icici_ref_no 
        ON ICICI_Savings_Transactions(ref_no)
        """)
        
        # Create index on transaction_date for faster lookups
        cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_icici_transaction_date 
        ON ICICI_Savings_Transactions(transaction_date)
        """)
        
        # Create trigger to update updated_at timestamp
        cursor.execute("""
        CREATE TRIGGER IF NOT EXISTS update_icici_timestamp 
        AFTER UPDATE ON ICICI_Savings_Transactions
        BEGIN
            UPDATE ICICI_Savings_Transactions 
            SET updated_at = CURRENT_TIMESTAMP 
            WHERE id = NEW.id;
        END;
        """)
        
        conn.commit()
        logger.info("ICICI_Savings_Transactions table created successfully")
        
    except Exception as e:
        logger.error(f"Error creating ICICI_Savings_Transactions table: {str(e)}")
        raise
        
    finally:
        conn.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_icici_transactions_table()
