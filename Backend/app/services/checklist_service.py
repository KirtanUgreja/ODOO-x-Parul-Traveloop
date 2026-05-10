"""Checklist service with CRUD operations."""

from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checklist_item import ChecklistItem
from app.services.trip_service import verify_trip_owner


class ChecklistItemNotFound(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Checklist item not found"}
        )


async def list_checklist_items(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
) -> List[ChecklistItem]:
    """List all checklist items for a trip."""
    await verify_trip_owner(trip_id, user_id, db)
    stmt = select(ChecklistItem).where(
        ChecklistItem.trip_id == trip_id
    ).order_by(ChecklistItem.sort_order, ChecklistItem.id)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_checklist_item(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
    text: str,
    is_done: bool = False,
    sort_order: int = 0,
) -> ChecklistItem:
    """Create a new checklist item."""
    await verify_trip_owner(trip_id, user_id, db)
    item = ChecklistItem(
        trip_id=trip_id,
        text=text,
        is_done=is_done,
        sort_order=sort_order,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update_checklist_item(
    db: AsyncSession,
    trip_id: str | UUID,
    item_id: str | UUID,
    user_id: str | UUID,
    text: str | None = None,
    is_done: bool | None = None,
    sort_order: int | None = None,
) -> ChecklistItem:
    """Update a checklist item."""
    await verify_trip_owner(trip_id, user_id, db)
    item = await db.get(ChecklistItem, item_id)
    if not item or item.trip_id != trip_id:
        raise ChecklistItemNotFound()
    if text is not None:
        item.text = text
    if is_done is not None:
        item.is_done = is_done
    if sort_order is not None:
        item.sort_order = sort_order
    await db.commit()
    await db.refresh(item)
    return item


async def delete_checklist_item(
    db: AsyncSession,
    trip_id: str | UUID,
    item_id: str | UUID,
    user_id: str | UUID,
) -> None:
    """Delete a checklist item."""
    await verify_trip_owner(trip_id, user_id, db)
    item = await db.get(ChecklistItem, item_id)
    if not item or item.trip_id != trip_id:
        raise ChecklistItemNotFound()
    await db.delete(item)
    await db.commit()


async def reset_checklist(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
) -> None:
    """Delete all checklist items for a trip."""
    await verify_trip_owner(trip_id, user_id, db)
    stmt = select(ChecklistItem).where(ChecklistItem.trip_id == trip_id)
    result = await db.execute(stmt)
    items = result.scalars().all()
    for item in items:
        await db.delete(item)
    await db.commit()


async def share_checklist(
    db: AsyncSession,
    trip_id: str | UUID,
    user_id: str | UUID,
) -> str:
    """Share checklist by returning a placeholder token."""
    await verify_trip_owner(trip_id, user_id, db)
    # Placeholder implementation - returns a placeholder token
    # SharedTrip model will be implemented in Task 13
    return f"checklist-{trip_id}"
