import pandas as pd
import logging
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional, Tuple

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def parse_amount(value: Any) -> Optional[Decimal]:
    """Convert amount string/float to Decimal, handling None values."""
    if pd.isna(value) or value == 0 or value == '0' or value == '-':
        return None
    try:
        # Remove any currency symbols and commas
        clean_value = str(value).replace('₹', '').replace(',', '').strip()
        return Decimal(clean_value)
    except Exception as e:
        logger.error(f"Error parsing amount {value}: {str(e)}")
        return None

def parse_date(date_str: str) -> Optional[datetime]:
    """Convert date string to datetime object."""
    try:
        if pd.isna(date_str) or date_str == '-':
            return None
        return datetime.strptime(str(date_str), '%d/%m/%Y').date()
    except Exception as e:
        logger.error(f"Error parsing date {date_str}: {str(e)}")
        return None

def validate_transaction(row: Dict[str, Any]) -> Dict[str, bool]:
    """
    Validate if a transaction row matches our schema requirements.
    
    Args:
        row (Dict[str, Any]): Dictionary containing transaction data
    
    Returns:
        Dict[str, bool]: Validation results for each required field
    """
    return {
        'transaction_date': bool(row.get('transaction_date')),
        'value_date': bool(row.get('value_date')),
        'description': bool(row.get('description')),
        'balance': bool(row.get('balance')),
        'has_amount': bool(row.get('debit') is not None or row.get('credit') is not None),
    }

def analyze_excel_file(file_path: str):
    """
    Analyze and validate ICICI bank statement Excel file against our schema.
    
    Args:
        file_path (str): Path to the Excel file
    """
    try:
        logger.info(f"Reading Excel file: {file_path}")
        
        # First, read the file to find the actual data section
        df_preview = pd.read_excel(file_path, nrows=25)
        
        # Find the actual transaction data section
        header_row = None
        for idx, row in df_preview.iterrows():
            # Convert all values to string and join
            row_text = ' '.join([str(x).strip() if pd.notna(x) else '' for x in row.values]).lower()
            if 'withdrawal amount' in row_text and 'deposit amount' in row_text:
                header_row = idx
                break
        
        if header_row is None:
            raise ValueError("Could not find transaction data section")
            
        logger.info(f"\nFound transaction header at row {header_row}")
        
        # Read the file again, now with the correct header
        df = pd.read_excel(file_path, skiprows=header_row)
        
        # Get the column names from the first row
        columns = {}
        first_row = df.iloc[0]
        for col in df.columns:
            value = first_row[col]
            if pd.notna(value):
                if 'Value Date' in str(value):
                    columns['Value Date'] = col
                elif 'Transaction Date' in str(value):
                    columns['Transaction Date'] = col
                elif 'Cheque Number' in str(value):
                    columns['Cheque Number'] = col
                elif 'Transaction Remarks' in str(value):
                    columns['Transaction Remarks'] = col
                elif 'Withdrawal Amount' in str(value):
                    columns['Withdrawal Amount (INR )'] = col
                elif 'Deposit Amount' in str(value):
                    columns['Deposit Amount (INR )'] = col
                elif 'Balance' in str(value):
                    columns['Balance (INR )'] = col
        
        logger.info("\nColumn mapping:")
        for k, v in columns.items():
            logger.info(f"  {k} -> {v}")
        
        # Skip the header row and process transactions
        data = df.iloc[1:]
        
        # Process a few sample transactions
        logger.info("\nAnalyzing sample transactions:")
        sample_size = min(5, len(data))
        
        for idx in range(sample_size):
            row = data.iloc[idx]
            
            # Create a transaction dict matching our schema
            transaction = {
                'transaction_date': parse_date(row[columns['Transaction Date']]),
                'value_date': parse_date(row[columns['Value Date']]),
                'description': str(row[columns['Transaction Remarks']]),
                'ref_no': str(row[columns['Cheque Number']]),
                'debit': parse_amount(row[columns['Withdrawal Amount (INR )']]),
                'credit': parse_amount(row[columns['Deposit Amount (INR )']]),
                'balance': parse_amount(row[columns['Balance (INR )']])
            }
            
            # Validate the transaction
            validation_results = validate_transaction(transaction)
            is_valid = all(validation_results.values())
            
            logger.info(f"\nTransaction {idx + 1}:")
            logger.info(f"Valid: {is_valid}")
            logger.info("Data:")
            for key, value in transaction.items():
                logger.info(f"  {key}: {value}")
            
            if not is_valid:
                logger.warning(f"Transaction {idx + 1} failed validation!")
                logger.warning("Validation results:")
                for field, valid in validation_results.items():
                    if not valid:
                        logger.warning(f"  - {field}: Failed")
        
        logger.info(f"\nTotal transactions in file: {len(data)}")
        
    except Exception as e:
        logger.error(f"Error analyzing Excel file: {str(e)}")
        raise

if __name__ == "__main__":
    file_path = "OpTransactionHistoryTpr24-11-2024.xls"
    analyze_excel_file(file_path)
