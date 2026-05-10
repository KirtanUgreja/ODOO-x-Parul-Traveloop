"""Share service for creating and validating share tokens."""

import secrets
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.shared_trip import SharedTrip
from app.models.trip import Trip
from app.services.trip_service import TripNotFound


class ShareTokenNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "SHARE_NOT_FOUND", "message": "Share token not found"})


class ShareTokenExpired(HTTPException):
    def __init__(self):
        super().__init__(status_code=410, detail={"code": "SHARE_EXPIRED", "message": "Share token expired"})


class ShareTokenRevoked(HTTPException):
    def __init__(self):
        super().__init__(status_code=410, detail={"code": "SHARE_REVOKED", "message": "Share token revoked"})


async def create_share_token(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
    expires_in_days: int = 7,
) -> SharedTrip:
    """Create a share token for a trip."""
    # Verify trip exists and belongs to user
    trip = await db.get(Trip, trip_id)
    if not trip:
        raise TripNotFound()
    if trip.user_id != user_id:
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Ownership required"})

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=expires_in_days)

    shared_trip = SharedTrip(
        trip_id=trip_id,
        token=token,
        created_by_user_id=user_id,
        expires_at=expires_at,
    )
    db.add(shared_trip)
    await db.commit()
    await db.refresh(shared_trip)
    return shared_trip


async def get_shared_trip(db: AsyncSession, token: str) -> SharedTrip:
    """Get a shared trip by token, validating it's not expired or revoked."""
    stmt = select(SharedTrip).where(SharedTrip.token == token)
    result = await db.execute(stmt)
    shared_trip = result.scalar_one_or_none()

    if not shared_trip:
        raise ShareTokenNotFound()

    if shared_trip.revoked_at:
        raise ShareTokenRevoked()

    if shared_trip.expires_at and shared_trip.expires_at < datetime.utcnow():
        raise ShareTokenExpired()

    return shared_trip


async def revoke_share_token(db: AsyncSession, token: str, user_id: str | UUID) -> None:
    """Revoke a share token (must be owner)."""
    stmt = select(SharedTrip).where(SharedTrip.token == token)
    result = await db.execute(stmt)
    shared_trip = result.scalar_one_or_none()

    if not shared_trip:
        raise ShareTokenNotFound()

    if shared_trip.created_by_user_id != user_id:
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Ownership required"})

    shared_trip.revoked_at = datetime.utcnow()
    await db.commit()
