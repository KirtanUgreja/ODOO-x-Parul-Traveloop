"""Notes router for managing trip notes."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate
from app.services import note_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.get("/{trip_id}/notes", response_model=None, status_code=status.HTTP_200_OK)
async def list_notes(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all notes for a trip."""
    notes = await note_service.list_notes(db, trip_id, current_user.id)
    return _make_success_response(
        [NoteResponse.model_validate(n).model_dump() for n in notes],
        request,
    )


@router.post("/{trip_id}/notes", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_note(
    request: Request,
    trip_id: str,
    body: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new note."""
    note = await note_service.create_note(
        db,
        trip_id=trip_id,
        user_id=current_user.id,
        content=body.content,
    )
    return _make_success_response(
        NoteResponse.model_validate(note).model_dump(),
        request,
    )


@router.patch("/{trip_id}/notes/{note_id}", response_model=None, status_code=status.HTTP_200_OK)
async def update_note(
    request: Request,
    trip_id: str,
    note_id: str,
    body: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a note."""
    note = await note_service.update_note(
        db,
        trip_id=trip_id,
        note_id=note_id,
        user_id=current_user.id,
        content=body.content,
    )
    return _make_success_response(
        NoteResponse.model_validate(note).model_dump(),
        request,
    )


@router.delete("/{trip_id}/notes/{note_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_note(
    request: Request,
    trip_id: str,
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a note."""
    await note_service.delete_note(db, trip_id, note_id, current_user.id)
    return _make_success_response(
        {"message": "Note deleted successfully"},
        request,
    )
