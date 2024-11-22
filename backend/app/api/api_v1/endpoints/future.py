"""API endpoints for future predictions."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date

from app.db.database import get_db
from app.crud import crud
from app.schemas import schemas
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[schemas.FuturePrediction])
async def get_future_predictions(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    paid_only: bool = False,
    unpaid_only: bool = False
):
    """Get list of future predictions with optional filtering.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        paid_only: Filter for paid predictions only
        unpaid_only: Filter for unpaid predictions only
    
    Returns:
        List[schemas.FuturePrediction]: List of future predictions
    """
    try:
        if unpaid_only:
            predictions = crud.future.get_unpaid(db, skip=skip, limit=limit)
        else:
            predictions = crud.future.get_all(db)
            if paid_only:
                predictions = [p for p in predictions if p.paid]
        return predictions
    except Exception as e:
        logger.error(f"Error fetching future predictions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching future predictions"
        )

@router.get("/date-range", response_model=List[schemas.FuturePrediction])
async def get_predictions_by_date_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """Get future predictions within a date range.
    
    Args:
        start_date: Start date
        end_date: End date
        db: Database session
    
    Returns:
        List[schemas.FuturePrediction]: List of future predictions
    """
    try:
        predictions = crud.future.get_by_date_range(db, start_date, end_date)
        return predictions
    except Exception as e:
        logger.error(f"Error fetching predictions by date range: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error fetching predictions by date range"
        )

@router.get("/{tr_no}", response_model=schemas.FuturePrediction)
async def get_future_prediction(tr_no: int, db: Session = Depends(get_db)):
    """Get future prediction by transaction number.
    
    Args:
        tr_no: Transaction number
        db: Database session
    
    Returns:
        schemas.FuturePrediction: Future prediction details
    
    Raises:
        HTTPException: If prediction not found
    """
    prediction = crud.future.get_by_tr_no(db, tr_no)
    if not prediction:
        raise HTTPException(status_code=404, detail="Future prediction not found")
    return prediction

@router.post("/", response_model=schemas.FuturePrediction)
async def create_future_prediction(
    prediction_in: schemas.FutureCreate,
    db: Session = Depends(get_db)
):
    """Create a new future prediction.
    
    Args:
        prediction_in: Future prediction data
        db: Database session
    
    Returns:
        schemas.FuturePrediction: Created future prediction
    """
    try:
        # Verify account exists
        account = crud.account.get_by_cc_id(db, prediction_in.acc_id)
        if not account:
            raise HTTPException(
                status_code=404,
                detail=f"Account with ID {prediction_in.acc_id} not found"
            )

        prediction = crud.future.create(db, obj_in=prediction_in)
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating future prediction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error creating future prediction"
        )

@router.put("/{tr_no}", response_model=schemas.FuturePrediction)
async def update_future_prediction(
    tr_no: int,
    prediction_in: schemas.FutureUpdate,
    db: Session = Depends(get_db)
):
    """Update a future prediction.
    
    Args:
        tr_no: Transaction number
        prediction_in: Updated prediction data
        db: Database session
    
    Returns:
        schemas.FuturePrediction: Updated future prediction
    
    Raises:
        HTTPException: If prediction not found
    """
    try:
        prediction = crud.future.get_by_tr_no(db, tr_no)
        if not prediction:
            raise HTTPException(
                status_code=404,
                detail="Future prediction not found"
            )

        # If account ID is being updated, verify new account exists
        if prediction_in.acc_id and prediction_in.acc_id != prediction.acc_id:
            account = crud.account.get_by_cc_id(db, prediction_in.acc_id)
            if not account:
                raise HTTPException(
                    status_code=404,
                    detail=f"Account with ID {prediction_in.acc_id} not found"
                )

        updated_prediction = crud.future.update(
            db, db_obj=prediction, obj_in=prediction_in
        )
        return updated_prediction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating future prediction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error updating future prediction"
        )

@router.patch("/{tr_no}/mark-paid", response_model=schemas.FuturePrediction)
async def mark_prediction_as_paid(tr_no: int, db: Session = Depends(get_db)):
    """Mark a future prediction as paid.
    
    Args:
        tr_no: Transaction number
        db: Database session
    
    Returns:
        schemas.FuturePrediction: Updated future prediction
    
    Raises:
        HTTPException: If prediction not found
    """
    try:
        prediction = crud.future.mark_as_paid(db, tr_no)
        if not prediction:
            raise HTTPException(
                status_code=404,
                detail="Future prediction not found"
            )
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking prediction as paid: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error marking prediction as paid"
        )

@router.delete("/{tr_no}", response_model=schemas.FuturePrediction)
async def delete_future_prediction(tr_no: int, db: Session = Depends(get_db)):
    """Delete a future prediction.
    
    Args:
        tr_no: Transaction number
        db: Database session
    
    Returns:
        schemas.FuturePrediction: Deleted future prediction
    
    Raises:
        HTTPException: If prediction not found
    """
    try:
        prediction = crud.future.get_by_tr_no(db, tr_no)
        if not prediction:
            raise HTTPException(
                status_code=404,
                detail="Future prediction not found"
            )

        deleted_prediction = crud.future.remove(db, id=tr_no)
        return deleted_prediction
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting future prediction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error deleting future prediction"
        )
