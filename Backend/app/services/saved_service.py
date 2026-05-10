"""Saved service for managing user's saved cities."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saved_city import SavedCity
from app.models.city import City


class SavedCityAlreadyExists(HTTPException):
    def __init__(self):
        super().__init__(status_code=409, detail={"code": "ALREADY_SAVED", "message": "City already saved"})


class SavedCityNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "SAVED_CITY_NOT_FOUND", "message": "Saved city not found"})


async def list_saved_cities(db: AsyncSession, user_id: str | UUID) -> list[SavedCity]:
    """List all saved cities for a user."""
    stmt = select(SavedCity).where(SavedCity.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def save_city(db: AsyncSession, user_id: str | UUID, city_id: str | UUID) -> SavedCity:
    """Save a city for a user."""
    # Check if city exists
    city = await db.get(City, city_id)
    if not city:
        raise HTTPException(status_code=404, detail={"code": "CITY_NOT_FOUND", "message": "City not found"})

    # Check if already saved
    stmt = select(SavedCity).where(SavedCity.user_id == user_id, SavedCity.city_id == city_id)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise SavedCityAlreadyExists()

    saved_city = SavedCity(user_id=user_id, city_id=city_id)
    db.add(saved_city)
    await db.commit()
    await db.refresh(saved_city)
    return saved_city


async def unsave_city(db: AsyncSession, user_id: str | UUID, city_id: str | UUID) -> None:
    """Remove a saved city for a user."""
    stmt = select(SavedCity).where(SavedCity.user_id == user_id, SavedCity.city_id == city_id)
    result = await db.execute(stmt)
    saved_city = result.scalar_one_or_none()

    if not saved_city:
        raise SavedCityNotFound()

    await db.delete(saved_city)
    await db.commit()
