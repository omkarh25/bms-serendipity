"""Main API router that includes all endpoint routers."""

from fastapi import APIRouter
from app.api.api_v1.endpoints import transactions, accounts, future, notifications

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["transactions"]
)

api_router.include_router(
    accounts.router,
    prefix="/accounts",
    tags=["accounts"]
)

api_router.include_router(
    future.router,
    prefix="/future",
    tags=["future"]
)

api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["notifications"]
)
