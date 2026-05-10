"""Community router for public trip sharing and community features."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.community import CommunityTripResponse
from app.services import community_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.get("", response_model=None, status_code=status.HTTP_200_OK)
async def list_community(
    request: Request,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List published community trips (public endpoint)."""
    items, total = await community_service.list_community_trips(db, page=page, limit=limit)
    return _make_success_response({
        "items": [CommunityTripResponse.model_validate(item).model_dump() for item in items],
        "total": total,
        "page": page,
        "limit": limit,
    }, request)


@router.post("/{trip_id}/copy", response_model=None, status_code=status.HTTP_201_CREATED)
async def copy_community_trip(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Copy a community trip to user's account (requires auth)."""
    new_trip = await community_service.copy_trip_to_user(db, trip_id, current_user.id)
    return _make_success_response({
        "message": "Trip copied successfully",
        "trip_id": str(new_trip.id),
    }, request)
