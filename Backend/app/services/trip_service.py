"""Trip service with CRUD operations and ownership verification."""

from datetime import date
from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.trip import Trip


class TripNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "TRIP_NOT_FOUND", "message": "Trip not found"})


class OwnershipRequired(HTTPException):
    def __init__(self):
        super().__init__(status_code=403, detail={"code": "FORBIDDEN", "message": "Ownership required"})


async def verify_trip_owner(trip_id: str | UUID, user_id: str | UUID, db: AsyncSession) -> Trip:
    """Verify user owns the trip. Returns trip if valid, raises otherwise."""
    trip = await db.get(Trip, trip_id)
    if not trip:
        raise TripNotFound()
    if trip.user_id != user_id:
        raise OwnershipRequired()
    return trip


async def list_trips(db: AsyncSession, user_id: str | UUID) -> List[Trip]:
    """List all trips for a user."""
    stmt = select(Trip).where(Trip.user_id == user_id).order_by(Trip.created_at if hasattr(Trip, 'created_at') else Trip.id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_trip(
    db: AsyncSession,
    user_id: str | UUID,
    title: str,
    description: str | None = None,
    city_id: str | UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> Trip:
    """Create a new trip."""
    trip = Trip(
        user_id=user_id,
        city_id=city_id,
        title=title,
        description=description,
        start_date=start_date,
        end_date=end_date,
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return trip


async def get_trip(db: AsyncSession, trip_id: str | UUID, user_id: str | UUID) -> Trip:
    """Get a trip by ID with ownership check."""
    return await verify_trip_owner(trip_id, user_id, db)


async def update_trip(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
    title: str | None = None,
    description: str | None = None,
    city_id: str | UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> Trip:
    """Update a trip."""
    trip = await verify_trip_owner(trip_id, user_id, db)

    if title is not None:
        trip.title = title
    if description is not None:
        trip.description = description
    if city_id is not None:
        trip.city_id = city_id
    if start_date is not None:
        trip.start_date = start_date
    if end_date is not None:
        trip.end_date = end_date

    await db.commit()
    await db.refresh(trip)
    return trip


async def delete_trip(db: AsyncSession, trip_id: str | UUID, user_id: str | UUID) -> None:
    """Delete a trip."""
    trip = await verify_trip_owner(trip_id, user_id, db)
    await db.delete(trip)
    await db.commit()
