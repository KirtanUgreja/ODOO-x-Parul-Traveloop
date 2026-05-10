"""Share router for public access to shared trips."""

import datetime as dt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.community import SharedTripPublicResponse
from app.services import share_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.get("/share/{token}", response_model=None, status_code=status.HTTP_200_OK)
async def get_shared_trip(
    request: Request,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a shared trip by token (public endpoint, no auth required)."""
    shared_trip = await share_service.get_shared_trip(db, token)
    trip = shared_trip.trip

    return _make_success_response({
        "trip_id": str(trip.id),
        "title": trip.title,
        "description": trip.description,
    }, request)
