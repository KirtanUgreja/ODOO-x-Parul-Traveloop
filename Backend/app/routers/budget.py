"""Budget router for managing budget items and invoices."""

import datetime as dt
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.budget import (
    BudgetItemCreate,
    BudgetItemUpdate,
    BudgetItemResponse,
    InvoiceResponse,
    InvoiceStatusUpdate,
)
from app.services import budget_service, invoice_service
from app.services.trip_service import verify_trip_owner

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


def _make_error_response(request: Request, code: str, message: str, status_code: int) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": dt.datetime.utcnow().isoformat() + "Z",
        }
    }


@router.get("/{trip_id}/budget", response_model=None, status_code=status.HTTP_200_OK)
async def get_budget(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all budget items for a trip."""
    await verify_trip_owner(trip_id, current_user.id, db)
    items = await budget_service.get_budget_items(db, trip_id)
    totals = await budget_service.calculate_budget_totals(db, trip_id)
    
    return _make_success_response(
        {
            "trip_id": trip_id,
            "items": [BudgetItemResponse.model_validate(item).model_dump() for item in items],
            "total": float(totals["total_budget"]),
            "item_count": totals["item_count"],
        },
        request,
    )


@router.post("/{trip_id}/budget/items", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_budget_item(
    request: Request,
    trip_id: str,
    body: BudgetItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new budget item."""
    await verify_trip_owner(trip_id, current_user.id, db)
    item = await budget_service.create_budget_item(
        db,
        trip_id=trip_id,
        category=body.category,
        description=body.description,
        quantity=body.quantity,
        unit_cost=body.unit_cost,
    )
    return _make_success_response(
        BudgetItemResponse.model_validate(item).model_dump(),
        request,
    )


@router.patch("/{trip_id}/budget/items/{budget_item_id}", response_model=None, status_code=status.HTTP_200_OK)
async def update_budget_item(
    request: Request,
    trip_id: str,
    budget_item_id: str,
    body: BudgetItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a budget item."""
    await verify_trip_owner(trip_id, current_user.id, db)
    
    # Get the item first to verify it belongs to this trip
    item = await budget_service.get_budget_item(db, budget_item_id)
    if str(item.trip_id) != trip_id:
        return _make_error_response(
            request,
            "NOT_FOUND",
            "Budget item not found for this trip",
            status.HTTP_404_NOT_FOUND,
        )
    
    updated = await budget_service.update_budget_item(
        db,
        budget_item_id=budget_item_id,
        category=body.category,
        description=body.description,
        quantity=body.quantity,
        unit_cost=body.unit_cost,
    )
    return _make_success_response(
        BudgetItemResponse.model_validate(updated).model_dump(),
        request,
    )


@router.delete("/{trip_id}/budget/items/{budget_item_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_budget_item(
    request: Request,
    trip_id: str,
    budget_item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a budget item."""
    await verify_trip_owner(trip_id, current_user.id, db)
    
    # Get the item first to verify it belongs to this trip
    item = await budget_service.get_budget_item(db, budget_item_id)
    if str(item.trip_id) != trip_id:
        return _make_error_response(
            request,
            "NOT_FOUND",
            "Budget item not found for this trip",
            status.HTTP_404_NOT_FOUND,
        )
    
    await budget_service.delete_budget_item(db, budget_item_id)
    return _make_success_response(
        {"message": "Budget item deleted successfully"},
        request,
    )


@router.get("/{trip_id}/invoice", response_model=None, status_code=status.HTTP_200_OK)
async def get_invoice(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get invoice for a trip."""
    await verify_trip_owner(trip_id, current_user.id, db)
    invoice_data = await invoice_service.get_invoice_with_details(db, trip_id)
    return _make_success_response(invoice_data, request)


@router.patch("/{trip_id}/invoice/status", response_model=None, status_code=status.HTTP_200_OK)
async def update_invoice_status(
    request: Request,
    trip_id: str,
    body: InvoiceStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update invoice status."""
    await verify_trip_owner(trip_id, current_user.id, db)
    invoice = await invoice_service.update_invoice_status_by_trip(db, trip_id, body.status)
    return _make_success_response(
        {"id": str(invoice.id), "status": invoice.status, "message": "Invoice status updated"},
        request,
    )
