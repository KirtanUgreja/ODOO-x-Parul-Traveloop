"""Sections router for managing trip sections."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.section import (
    SectionCreate,
    SectionResponse,
    SectionUpdate,
    SectionReorderRequest,
)
from app.services import section_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.get("/{trip_id}/sections", response_model=None, status_code=status.HTTP_200_OK)
async def list_sections(
    request: Request,
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all sections for a trip."""
    sections = await section_service.list_sections(db, trip_id, current_user.id)
    return _make_success_response(
        [SectionResponse.model_validate(s).model_dump() for s in sections],
        request,
    )


@router.post("/{trip_id}/sections", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_section(
    request: Request,
    trip_id: str,
    body: SectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new section in a trip."""
    section = await section_service.create_section(
        db,
        trip_id=trip_id,
        user_id=current_user.id,
        title=body.title,
        sort_order=body.sort_order,
    )
    return _make_success_response(
        SectionResponse.model_validate(section).model_dump(),
        request,
    )


@router.patch("/{trip_id}/sections/{section_id}", response_model=None, status_code=status.HTTP_200_OK)
async def update_section(
    request: Request,
    trip_id: str,
    section_id: str,
    body: SectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a section."""
    section = await section_service.update_section(
        db,
        section_id=section_id,
        user_id=current_user.id,
        title=body.title,
        sort_order=body.sort_order,
    )
    return _make_success_response(
        SectionResponse.model_validate(section).model_dump(),
        request,
    )


@router.delete("/{trip_id}/sections/{section_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_section(
    request: Request,
    trip_id: str,
    section_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a section."""
    await section_service.delete_section(db, section_id, current_user.id)
    return _make_success_response(
        {"message": "Section deleted successfully"},
        request,
    )


@router.post("/{trip_id}/sections/reorder", response_model=None, status_code=status.HTTP_200_OK)
async def reorder_sections(
    request: Request,
    trip_id: str,
    body: SectionReorderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reorder sections within a trip."""
    sections = await section_service.reorder_sections(
        db,
        trip_id=trip_id,
        user_id=current_user.id,
        section_ids=body.section_ids,
    )
    return _make_success_response(
        [SectionResponse.model_validate(s).model_dump() for s in sections],
        request,
    )
