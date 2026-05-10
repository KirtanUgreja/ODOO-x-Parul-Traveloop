"""Section service with CRUD and reorder operations."""

from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.section import Section
from app.services.trip_service import verify_trip_owner


class SectionNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "SECTION_NOT_FOUND", "message": "Section not found"})


async def list_sections(db: AsyncSession, trip_id: str | UUID, user_id: str | UUID) -> List[Section]:
    """List all sections for a trip."""
    await verify_trip_owner(trip_id, user_id, db)
    stmt = select(Section).where(Section.trip_id == trip_id).order_by(Section.sort_order)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_section(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
    title: str,
    sort_order: int = 0,
) -> Section:
    """Create a new section."""
    await verify_trip_owner(trip_id, user_id, db)

    section = Section(
        trip_id=trip_id,
        title=title,
        sort_order=sort_order,
    )
    db.add(section)
    await db.commit()
    await db.refresh(section)
    return section


async def get_section(db: AsyncSession, section_id: str | UUID, user_id: str | UUID) -> Section:
    """Get a section by ID with ownership check."""
    stmt = select(Section).where(Section.id == section_id)
    result = await db.execute(stmt)
    section = result.scalar_one_or_none()

    if not section:
        raise SectionNotFound()

    await verify_trip_owner(section.trip_id, user_id, db)
    return section


async def update_section(
    db: AsyncSession,
    section_id: str | UUID,
    user_id: str | UUID,
    title: str | None = None,
    sort_order: int | None = None,
) -> Section:
    """Update a section."""
    section = await get_section(db, section_id, user_id)

    if title is not None:
        section.title = title
    if sort_order is not None:
        section.sort_order = sort_order

    await db.commit()
    await db.refresh(section)
    return section


async def delete_section(db: AsyncSession, section_id: str | UUID, user_id: str | UUID) -> None:
    """Delete a section."""
    section = await get_section(db, section_id, user_id)
    await db.delete(section)
    await db.commit()


async def reorder_sections(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
    section_ids: List[str | UUID],
) -> List[Section]:
    """Reorder sections within a trip."""
    await verify_trip_owner(trip_id, user_id, db)

    stmt = select(Section).where(Section.trip_id == trip_id)
    result = await db.execute(stmt)
    sections = {str(s.id): s for s in result.scalars().all()}

    for idx, section_id in enumerate(section_ids):
        if str(section_id) in sections:
            sections[str(section_id)].sort_order = idx

    await db.commit()

    return await list_sections(db, trip_id, user_id)
