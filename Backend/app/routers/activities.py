"""Activities router for managing section activities."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.activity import (
    ActivityCreate,
    ActivityResponse,
    ActivityUpdate,
    ActivityReorderRequest,
)
from app.services import activity_service, section_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.get("/{trip_id}/sections/{section_id}/activities", response_model=None, status_code=status.HTTP_200_OK)
async def list_activities(
    request: Request,
    trip_id: str,
    section_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all activities for a section."""
    # Verify ownership through section
    await section_service.get_section(db, section_id, current_user.id)
    activities = await activity_service.list_activities(db, section_id)
    return _make_success_response(
        [ActivityResponse.model_validate(a).model_dump() for a in activities],
        request,
    )


@router.post("/{trip_id}/sections/{section_id}/activities", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_activity(
    request: Request,
    trip_id: str,
    section_id: str,
    body: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new activity in a section."""
    # Verify ownership through section
    await section_service.get_section(db, section_id, current_user.id)
    activity = await activity_service.create_activity(
        db,
        section_id=section_id,
        title=body.title,
        description=body.description,
        sort_order=body.sort_order,
    )
    return _make_success_response(
        ActivityResponse.model_validate(activity).model_dump(),
        request,
    )


@router.patch("/{trip_id}/sections/{section_id}/activities/{activity_id}", response_model=None, status_code=status.HTTP_200_OK)
async def update_activity(
    request: Request,
    trip_id: str,
    section_id: str,
    activity_id: str,
    body: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an activity."""
    # Verify ownership through section
    await section_service.get_section(db, section_id, current_user.id)
    activity = await activity_service.update_activity(
        db,
        activity_id=activity_id,
        title=body.title,
        description=body.description,
        sort_order=body.sort_order,
    )
    return _make_success_response(
        ActivityResponse.model_validate(activity).model_dump(),
        request,
    )


@router.delete("/{trip_id}/sections/{section_id}/activities/{activity_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_activity(
    request: Request,
    trip_id: str,
    section_id: str,
    activity_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an activity."""
    # Verify ownership through section
    await section_service.get_section(db, section_id, current_user.id)
    await activity_service.delete_activity(db, activity_id)
    return _make_success_response(
        {"message": "Activity deleted successfully"},
        request,
    )


@router.post("/{trip_id}/sections/{section_id}/activities/reorder", response_model=None, status_code=status.HTTP_200_OK)
async def reorder_activities(
    request: Request,
    trip_id: str,
    section_id: str,
    body: ActivityReorderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reorder activities within a section."""
    # Verify ownership through section
    await section_service.get_section(db, section_id, current_user.id)
    activities = await activity_service.reorder_activities(
        db,
        section_id=section_id,
        activity_ids=body.activity_ids,
    )
    return _make_success_response(
        [ActivityResponse.model_validate(a).model_dump() for a in activities],
        request,
    )
