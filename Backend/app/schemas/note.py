"""Note schemas for request/response validation."""

from uuid import UUID
from pydantic import BaseModel, ConfigDict


class NoteBase(BaseModel):
    content: str


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    content: str


class NoteResponse(NoteBase):
    id: UUID
    trip_id: UUID

    model_config = ConfigDict(from_attributes=True)
