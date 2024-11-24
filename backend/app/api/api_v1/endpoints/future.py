"""
API endpoints for handling future payments.
Following Single Responsibility and Dependency Injection principles.
"""
import logging
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.services.payment.future_payment_service import FuturePaymentService
from app.services.notification.telegram import TelegramNotificationProvider
from app.schemas.schemas import FuturePrediction, FutureCreate, FutureUpdate
from app.crud.crud_future import CRUDFuture

router = APIRouter()
logger = logging.getLogger(__name__)

async def get_payment_service(
    db: Session = Depends(deps.get_db),
    notification_provider: Optional[TelegramNotificationProvider] = Depends(
        deps.get_notification_provider,
        use_cache=True
    )
) -> FuturePaymentService:
    """Dependency to get configured payment service."""
    return FuturePaymentService(
        db=db,
        notification_provider=notification_provider
    )

@router.get("/predictions", response_model=List[FuturePrediction])
async def get_future_predictions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    paid_status: Optional[bool] = Query(None, description="Filter by paid status"),
    payment_service: FuturePaymentService = Depends(get_payment_service)
) -> List[FuturePrediction]:
    """
    Get future payment predictions with optional date range and paid status filters.
    """
    try:
        if paid_status is False:
            payments = await payment_service.get_unpaid_payments(
                start_date=start_date,
                end_date=end_date
            )
        else:
            # Use the CRUD directly for other queries as the service focuses on unpaid payments
            crud = CRUDFuture()
            payments = crud.get_by_date_range(
                db=payment_service.db,
                start_date=start_date,
                end_date=end_date,
                paid_status=paid_status
            )
        
        logger.info(f"Retrieved {len(payments)} future predictions")
        return payments
        
    except Exception as e:
        logger.error(f"Error retrieving future predictions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve future predictions: {str(e)}"
        )

@router.get("/predictions/upcoming", response_model=List[FuturePrediction])
async def get_upcoming_predictions(
    days_ahead: int = Query(7, description="Number of days to look ahead"),
    payment_service: FuturePaymentService = Depends(get_payment_service)
) -> List[FuturePrediction]:
    """Get upcoming payment predictions for the next specified number of days."""
    try:
        payments = await payment_service.get_upcoming_payments(days_ahead=days_ahead)
        logger.info(f"Retrieved {len(payments)} upcoming predictions")
        return payments
        
    except Exception as e:
        logger.error(f"Error retrieving upcoming predictions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve upcoming predictions: {str(e)}"
        )

@router.get("/predictions/{tr_no}", response_model=FuturePrediction)
async def get_future_prediction(
    tr_no: int,
    db: Session = Depends(deps.get_db)
) -> FuturePrediction:
    """Get a specific future payment prediction by transaction number."""
    try:
        crud = CRUDFuture()
        payment = crud.get(db=db, id=tr_no)
        if not payment:
            raise HTTPException(
                status_code=404,
                detail=f"Future prediction {tr_no} not found"
            )
        return payment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving future prediction {tr_no}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve future prediction: {str(e)}"
        )

@router.post("/predictions", response_model=FuturePrediction)
async def create_future_prediction(
    prediction: FutureCreate,
    db: Session = Depends(deps.get_db)
) -> FuturePrediction:
    """Create a new future payment prediction."""
    try:
        crud = CRUDFuture()
        payment = crud.create(db=db, obj_in=prediction)
        logger.info(f"Created future prediction {payment.TrNo}")
        return payment
        
    except Exception as e:
        logger.error(f"Error creating future prediction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create future prediction: {str(e)}"
        )

@router.put("/predictions/{tr_no}", response_model=FuturePrediction)
async def update_future_prediction(
    tr_no: int,
    prediction: FutureUpdate,
    db: Session = Depends(deps.get_db)
) -> FuturePrediction:
    """Update an existing future payment prediction."""
    try:
        crud = CRUDFuture()
        existing_payment = crud.get(db=db, id=tr_no)
        if not existing_payment:
            raise HTTPException(
                status_code=404,
                detail=f"Future prediction {tr_no} not found"
            )
            
        payment = crud.update(db=db, db_obj=existing_payment, obj_in=prediction)
        logger.info(f"Updated future prediction {tr_no}")
        return payment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating future prediction {tr_no}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update future prediction: {str(e)}"
        )

@router.post("/predictions/{tr_no}/mark-paid", response_model=FuturePrediction)
async def mark_prediction_as_paid(
    tr_no: int,
    payment_service: FuturePaymentService = Depends(get_payment_service)
) -> FuturePrediction:
    """Mark a future payment prediction as paid."""
    try:
        payment = await payment_service.mark_payment_as_paid(tr_no=tr_no)
        if not payment:
            raise HTTPException(
                status_code=404,
                detail=f"Future prediction {tr_no} not found"
            )
            
        logger.info(f"Marked future prediction {tr_no} as paid")
        return payment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking future prediction {tr_no} as paid: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark prediction as paid: {str(e)}"
        )

@router.delete("/predictions/{tr_no}")
async def delete_future_prediction(
    tr_no: int,
    db: Session = Depends(deps.get_db)
) -> dict:
    """Delete a future payment prediction."""
    try:
        crud = CRUDFuture()
        payment = crud.remove(db=db, id=tr_no)
        if not payment:
            raise HTTPException(
                status_code=404,
                detail=f"Future prediction {tr_no} not found"
            )
            
        logger.info(f"Deleted future prediction {tr_no}")
        return {"status": "success", "message": f"Future prediction {tr_no} deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting future prediction {tr_no}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete future prediction: {str(e)}"
        )
