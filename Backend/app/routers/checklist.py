"""Checklist router for managing checklist items."""

import datetime as dt
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemResponse, ChecklistItemUpdate, ChecklistShareResponse
from app.services import checklist_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.get("/{trip_id}/checklist", response_model=None, status_code=status.HTTP_200_OK)
async def list_checklist(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all checklist items for a trip."""
    items = await checklist_service.list_checklist_items(db, trip_id, current_user.id)
    return _make_success_response(
        [ChecklistItemResponse.model_validate(i).model_dump() for i in items],
        request,
    )


@router.post("/{trip_id}/checklist/items", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_checklist_item(
    request: Request,
    trip_id: str,
    body: ChecklistItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new checklist item."""
    item = await checklist_service.create_checklist_item(
        db,
        trip_id=trip_id,
        user_id=current_user.id,
        text=body.text,
        is_done=body.is_done,
        sort_order=body.sort_order,
    )
    return _make_success_response(
        ChecklistItemResponse.model_validate(item).model_dump(),
        request,
    )


@router.patch("/{trip_id}/checklist/items/{item_id}", response_model=None, status_code=status.HTTP_200_OK)
async def update_checklist_item(
    request: Request,
    trip_id: str,
    item_id: str,
    body: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a checklist item."""
    item = await checklist_service.update_checklist_item(
        db,
        trip_id=trip_id,
        item_id=item_id,
        user_id=current_user.id,
        text=body.text,
        is_done=body.is_done,
        sort_order=body.sort_order,
    )
    return _make_success_response(
        ChecklistItemResponse.model_validate(item).model_dump(),
        request,
    )


@router.delete("/{trip_id}/checklist/items/{item_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_checklist_item(
    request: Request,
    trip_id: str,
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a checklist item."""
    await checklist_service.delete_checklist_item(db, trip_id, item_id, current_user.id)
    return _make_success_response(
        {"message": "Checklist item deleted successfully"},
        request,
    )


@router.delete("/{trip_id}/checklist/reset", response_model=None, status_code=status.HTTP_200_OK)
async def reset_checklist(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reset/delete all checklist items for a trip."""
    await checklist_service.reset_checklist(db, trip_id, current_user.id)
    return _make_success_response(
        {"message": "Checklist reset successfully"},
        request,
    )


@router.post("/{trip_id}/checklist/share", response_model=None, status_code=status.HTTP_200_OK)
async def share_checklist(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Share checklist by returning a placeholder token."""
    token = await checklist_service.share_checklist(db, trip_id, current_user.id)
    return _make_success_response(
        {"token": token},
        request,
    )
