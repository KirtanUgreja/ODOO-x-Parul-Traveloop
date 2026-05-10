"""Note service with CRUD operations."""

from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note
from app.services.trip_service import verify_trip_owner


class NoteNotFound(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Note not found"}
        )


async def list_notes(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
) -> List[Note]:
    """List all notes for a trip."""
    await verify_trip_owner(trip_id, user_id, db)
    stmt = select(Note).where(Note.trip_id == trip_id).order_by(Note.id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_note(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
    content: str,
) -> Note:
    """Create a new note."""
    await verify_trip_owner(trip_id, user_id, db)
    note = Note(trip_id=trip_id, content=content)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


async def update_note(
    db: AsyncSession,
    trip_id: str | UUID,
    note_id: str | UUID,
    user_id: str | UUID,
    content: str,
) -> Note:
    """Update a note."""
    await verify_trip_owner(trip_id, user_id, db)
    note = await db.get(Note, note_id)
    if not note or note.trip_id != trip_id:
        raise NoteNotFound()
    note.content = content
    await db.commit()
    await db.refresh(note)
    return note


async def delete_note(
    db: AsyncSession,
    trip_id: str | UUID,
    note_id: str | UUID,
    user_id: str | UUID,
) -> None:
    """Delete a note."""
    await verify_trip_owner(trip_id, user_id, db)
    note = await db.get(Note, note_id)
    if not note or note.trip_id != trip_id:
        raise NoteNotFound()
    await db.delete(note)
    await db.commit()
