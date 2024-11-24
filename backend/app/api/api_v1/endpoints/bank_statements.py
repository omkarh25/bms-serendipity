"""API endpoints for bank statement operations."""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from decimal import Decimal

from app.db.database import get_db
from app.crud import crud_icici
from app.schemas import schemas
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

def parse_icici_statement(file: UploadFile) -> List[schemas.ICICITransactionCreate]:
    """
    Parse ICICI bank statement Excel file.
    
    Args:
        file: Uploaded Excel file
        
    Returns:
        List[schemas.ICICITransactionCreate]: List of parsed transactions
        
    Raises:
        HTTPException: If file format is invalid
    """
    try:
        # Read Excel file based on extension
        file_extension = file.filename.split('.')[-1].lower()
        
        # Skip header rows and read actual transaction data
        if file_extension == 'xls':
            df = pd.read_excel(file.file, engine='xlrd', skiprows=20)
        elif file_extension == 'xlsx':
            df = pd.read_excel(file.file, engine='openpyxl', skiprows=20)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Only Excel files (.xls, .xlsx) are supported."
            )
        
        # Log the columns we found
        logger.debug(f"Found columns: {list(df.columns)}")
        
        # Drop any unnamed columns and empty rows
        df = df.dropna(how='all')
        df = df.dropna(axis=1, how='all')
        
        # Log the first few rows
        logger.debug(f"First few rows after cleaning:\n{df.head()}")
        
        transactions = []
        for _, row in df.iterrows():
            try:
                # Convert amounts to Decimal, handling NaN values
                debit = Decimal(str(row['Debit'])) if pd.notna(row['Debit']) else None
                credit = Decimal(str(row['Credit'])) if pd.notna(row['Credit']) else None
                balance = Decimal(str(row['Balance']))
                
                # Create transaction object
                transaction = schemas.ICICITransactionCreate(
                    transaction_date=pd.to_datetime(row['Transaction Date']).date(),
                    value_date=pd.to_datetime(row['Value Date']).date(),
                    description=str(row['Description']),
                    ref_no=str(row['Ref No./Cheque No.']),
                    debit=debit,
                    credit=credit,
                    balance=balance,
                    reconciled=False,
                    transaction_id=None
                )
                transactions.append(transaction)
            except Exception as e:
                logger.error(f"Error processing row: {row}")
                logger.error(f"Error details: {str(e)}")
                continue
            
        return transactions
        
    except Exception as e:
        logger.error(f"Error parsing ICICI statement: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Error parsing bank statement: {str(e)}"
        )

@router.post("/upload/icici", response_model=schemas.BankStatementUploadResponse)
async def upload_icici_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload and process ICICI bank statement.
    
    Args:
        file: Excel file containing bank statement
        db: Database session
        
    Returns:
        BankStatementUploadResponse: Upload statistics
    """
    try:
        if not file.filename.lower().endswith(('.xls', '.xlsx')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Only Excel files (.xls, .xlsx) are supported."
            )
            
        # Parse transactions from file
        transactions = parse_icici_statement(file)
        
        if not transactions:
            raise HTTPException(
                status_code=400,
                detail="No valid transactions found in the statement"
            )
            
        # Bulk create transactions
        stats = crud_icici.bulk_create_transactions(db, transactions)
        
        return schemas.BankStatementUploadResponse(
            total_transactions=stats["total_transactions"],
            new_transactions=stats["new_transactions"],
            duplicate_transactions=stats["duplicate_transactions"],
            message="Bank statement processed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing bank statement: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing bank statement"
        )

@router.post("/reconcile/icici", response_model=schemas.ReconciliationResponse)
async def reconcile_icici_transactions(db: Session = Depends(get_db)):
    """
    Reconcile ICICI transactions with main transactions.
    
    Args:
        db: Database session
        
    Returns:
        ReconciliationResponse: Reconciliation statistics
    """
    try:
        stats = crud_icici.reconcile_transactions(db)
        
        return schemas.ReconciliationResponse(
            total_transactions=stats["total_transactions"],
            reconciled_transactions=stats["reconciled_transactions"],
            unreconciled_transactions=stats["unreconciled_transactions"],
            message="Reconciliation completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error during reconciliation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error during reconciliation"
        )

@router.get("/icici", response_model=List[schemas.ICICITransaction])
async def get_icici_transactions(
    skip: int = 0,
    limit: int = 100,
    reconciled: bool = None,
    db: Session = Depends(get_db)
):
    """
    Get ICICI transactions with optional reconciliation filter.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        reconciled: Filter by reconciliation status
        db: Database session
        
    Returns:
        List[ICICITransaction]: List of transactions
    """
    try:
        transactions = crud_icici.get_all(
            db, skip=skip, limit=limit, reconciled=reconciled
        )
        return transactions
        
    except Exception as e:
        logger.error(f"Error fetching ICICI transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching transactions"
        )
