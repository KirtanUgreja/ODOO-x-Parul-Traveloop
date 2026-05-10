"""Community service for listing and copying community trips."""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.community_trip import CommunityTrip
from app.models.trip import Trip
from app.models.section import Section
from app.models.section_activity import SectionActivity


class CommunityTripNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "COMMUNITY_TRIP_NOT_FOUND", "message": "Community trip not found"})


async def list_community_trips(db: AsyncSession, page: int = 1, limit: int = 20) -> tuple[list[CommunityTrip], int]:
    """List published community trips."""
    # Get total count
    total_result = await db.execute(select(CommunityTrip).where(CommunityTrip.moderation_status == "approved"))
    all_items = total_result.scalars().all()
    total = len(all_items)

    # Get paginated items
    stmt = (
        select(CommunityTrip)
        .where(CommunityTrip.moderation_status == "approved")
        .order_by(CommunityTrip.is_featured.desc(), CommunityTrip.published_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    items = result.scalars().all()

    return items, total


async def get_community_trip(db: AsyncSession, community_trip_id: str | UUID) -> CommunityTrip:
    """Get a community trip by ID."""
    trip = await db.get(CommunityTrip, community_trip_id)
    if not trip:
        raise CommunityTripNotFound()
    return trip


async def copy_trip_to_user(
    db: AsyncSession,
    community_trip_id: str | UUID,
    user_id: str | UUID,
) -> Trip:
    """Copy a community trip to user's account."""
    community_trip = await get_community_trip(db, community_trip_id)
    source_trip = community_trip.source_trip

    # Create new trip
    new_trip = Trip(
        user_id=user_id,
        city_id=source_trip.city_id,
        title=f"{source_trip.title} (Copy)",
        description=source_trip.description,
        start_date=source_trip.start_date,
        end_date=source_trip.end_date,
    )
    db.add(new_trip)
    await db.flush()

    # Copy sections and activities
    for section in source_trip.sections:
        new_section = Section(
            trip_id=new_trip.id,
            title=section.title,
            sort_order=section.sort_order,
        )
        db.add(new_section)
        await db.flush()

        for activity in section.activities:
            new_activity = SectionActivity(
                section_id=new_section.id,
                name=activity.name,
                description=activity.description,
                cost=activity.cost,
                currency=activity.currency,
                sort_order=activity.sort_order,
            )
            db.add(new_activity)

    await db.commit()
    await db.refresh(new_trip)
    return new_trip
