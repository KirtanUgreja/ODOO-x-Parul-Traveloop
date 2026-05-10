from datetime import date
from pydantic import BaseModel, Field
from typing import List, Optional


class TripBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    city_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    city_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    city_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    city_id: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]

    class Config:
        from_attributes = True


class TripListResponse(BaseModel):
    data: List[TripResponse]
