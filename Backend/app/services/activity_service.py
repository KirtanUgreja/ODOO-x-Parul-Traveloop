"""Activity service with CRUD operations."""

from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.section_activity import SectionActivity
from app.services.section_service import SectionNotFound


class ActivityNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "ACTIVITY_NOT_FOUND", "message": "Activity not found"})


async def list_activities(db: AsyncSession, section_id: str | UUID) -> List[SectionActivity]:
    """List all activities for a section."""
    stmt = select(SectionActivity).where(SectionActivity.section_id == section_id).order_by(SectionActivity.sort_order)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_activity(
    db: AsyncSession,
    section_id: str | UUID,
    title: str,
    description: str | None = None,
    sort_order: int = 0,
) -> SectionActivity:
    """Create a new activity."""
    activity = SectionActivity(
        section_id=section_id,
        title=title,
        description=description,
        sort_order=sort_order,
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity


async def get_activity(db: AsyncSession, activity_id: str | UUID) -> SectionActivity:
    """Get an activity by ID."""
    activity = await db.get(SectionActivity, activity_id)
    if not activity:
        raise ActivityNotFound()
    return activity


async def update_activity(
    db: AsyncSession,
    activity_id: str | UUID,
    title: str | None = None,
    description: str | None = None,
    sort_order: int | None = None,
) -> SectionActivity:
    """Update an activity."""
    activity = await get_activity(db, activity_id)

    if title is not None:
        activity.title = title
    if description is not None:
        activity.description = description
    if sort_order is not None:
        activity.sort_order = sort_order

    await db.commit()
    await db.refresh(activity)
    return activity


async def delete_activity(db: AsyncSession, activity_id: str | UUID) -> None:
    """Delete an activity."""
    activity = await get_activity(db, activity_id)
    await db.delete(activity)
    await db.commit()


async def reorder_activities(
    db: AsyncSession,
    section_id: str | UUID,
    activity_ids: List[str | UUID],
) -> List[SectionActivity]:
    """Reorder activities within a section."""
    stmt = select(SectionActivity).where(SectionActivity.section_id == section_id)
    result = await db.execute(stmt)
    activities = {str(a.id): a for a in result.scalars().all()}

    for idx, activity_id in enumerate(activity_ids):
        if str(activity_id) in activities:
            activities[str(activity_id)].sort_order = idx

    await db.commit()

    return await list_activities(db, section_id)
