"""Trips router for managing trips."""

import datetime as dt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.trip import TripCreate, TripResponse, TripUpdate, TripListResponse
from app.services import trip_service, share_service

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


@router.get("", response_model=None, status_code=status.HTTP_200_OK)
async def list_trips(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all trips for the current user."""
    trips = await trip_service.list_trips(db, current_user.id)
    return _make_success_response(
        [TripResponse.model_validate(t).model_dump() for t in trips],
        request,
    )


@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_trip(
    request: Request,
    body: TripCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new trip."""
    trip = await trip_service.create_trip(
        db,
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        city_id=body.city_id,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    return _make_success_response(
        TripResponse.model_validate(trip).model_dump(),
        request,
    )


@router.get("/{trip_id}", response_model=None, status_code=status.HTTP_200_OK)
async def get_trip(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a trip by ID."""
    trip = await trip_service.get_trip(db, trip_id, current_user.id)
    return _make_success_response(
        TripResponse.model_validate(trip).model_dump(),
        request,
    )


@router.patch("/{trip_id}", response_model=None, status_code=status.HTTP_200_OK)
async def update_trip(
    request: Request,
    trip_id: str,
    body: TripUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a trip."""
    trip = await trip_service.update_trip(
        db,
        trip_id=trip_id,
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        city_id=body.city_id,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    return _make_success_response(
        TripResponse.model_validate(trip).model_dump(),
        request,
    )


@router.delete("/{trip_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_trip(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a trip."""
    await trip_service.delete_trip(db, trip_id, current_user.id)
    return _make_success_response(
        {"message": "Trip deleted successfully"},
        request,
    )


@router.post("/{trip_id}/share", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_share(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    expires_in_days: int = 7,
):
    """Create a share token for a trip."""
    shared_trip = await share_service.create_share_token(
        db,
        trip_id=trip_id,
        user_id=current_user.id,
        expires_in_days=expires_in_days,
    )
    return _make_success_response({
        "id": str(shared_trip.id),
        "trip_id": str(shared_trip.trip_id),
        "token": shared_trip.token,
        "expires_at": shared_trip.expires_at.isoformat() if shared_trip.expires_at else None,
    }, request)
