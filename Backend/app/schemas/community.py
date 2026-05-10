from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class CommunityTripBase(BaseModel):
    title: str
    summary: Optional[str] = None


class CommunityTripResponse(CommunityTripBase):
    id: str
    source_trip_id: str
    created_by_user_id: str
    published_at: datetime
    moderation_status: str
    is_featured: bool

    class Config:
        from_attributes = True


class CommunityTripListResponse(BaseModel):
    data: list[CommunityTripResponse]
    total: int
    page: int
    limit: int


class SharedTripResponse(BaseModel):
    id: str
    trip_id: str
    token: str
    created_by_user_id: str
    expires_at: Optional[datetime]
    revoked_at: Optional[datetime]

    class Config:
        from_attributes = True


class SharedTripPublicResponse(BaseModel):
    """Public view of a shared trip - minimal info."""
    trip_id: str
    title: str
    description: Optional[str]


class CopyTripResponse(BaseModel):
    """Response after copying a community trip."""
    message: str
    trip_id: str
