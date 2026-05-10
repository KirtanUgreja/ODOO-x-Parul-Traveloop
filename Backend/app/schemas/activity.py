from pydantic import BaseModel, Field
from typing import List, Optional


class ActivityBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    sort_order: int = 0


class ActivityCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    sort_order: int = 0


class ActivityUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    sort_order: Optional[int] = None


class ActivityResponse(BaseModel):
    id: str
    section_id: str
    title: str
    description: Optional[str]
    sort_order: int

    class Config:
        from_attributes = True


class ActivityListResponse(BaseModel):
    data: List[ActivityResponse]


class ActivityReorderRequest(BaseModel):
    activity_ids: List[str]
