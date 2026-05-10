from pydantic import BaseModel, Field
from typing import List, Optional


class SectionBase(BaseModel):
    title: str = Field(..., min_length=1)
    sort_order: int = 0


class SectionCreate(BaseModel):
    title: str = Field(..., min_length=1)
    sort_order: int = 0


class SectionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    sort_order: Optional[int] = None


class SectionResponse(BaseModel):
    id: str
    trip_id: str
    title: str
    sort_order: int

    class Config:
        from_attributes = True


class SectionListResponse(BaseModel):
    data: List[SectionResponse]


class SectionReorderRequest(BaseModel):
    section_ids: List[str]
