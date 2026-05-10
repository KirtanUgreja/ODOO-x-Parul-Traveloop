"""Checklist schemas for request/response validation."""

from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ChecklistItemBase(BaseModel):
    text: str
    is_done: bool = False
    sort_order: int = 0


class ChecklistItemCreate(ChecklistItemBase):
    pass


class ChecklistItemUpdate(BaseModel):
    text: str | None = None
    is_done: bool | None = None
    sort_order: int | None = None


class ChecklistItemResponse(ChecklistItemBase):
    id: UUID
    trip_id: UUID

    model_config = ConfigDict(from_attributes=True)


class ChecklistShareResponse(BaseModel):
    token: str
