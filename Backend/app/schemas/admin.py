"""Admin schemas for analytics and user management."""

from datetime import date
from pydantic import BaseModel
from typing import List, Optional


class UserAdminResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    city: Optional[str]
    country: Optional[str]
    role: str
    is_banned: bool

    class Config:
        from_attributes = True


class UserAdminListResponse(BaseModel):
    data: List[UserAdminResponse]
    total: int
    page: int
    total_pages: int


class UserAdminUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None
    is_banned: Optional[bool] = None


class TripAdminResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    city_id: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]

    class Config:
        from_attributes = True


class TripAdminListResponse(BaseModel):
    data: List[TripAdminResponse]
    total: int
    page: int
    total_pages: int


class AdminStatsResponse(BaseModel):
    totalUsers: int
    totalTrips: int
    totalCities: int
    totalActivities: int


class TopCityItem(BaseModel):
    city_id: str
    city_name: str
    city_country: str
    trip_count: int


class TopActivityItem(BaseModel):
    activity_title: str
    activity_count: int


class UserTrendItem(BaseModel):
    date: str
    count: int


class TripTrendItem(BaseModel):
    date: str
    count: int


class AdminAnalyticsResponse(BaseModel):
    topCities: List[TopCityItem]
    topActivities: List[TopActivityItem]
    userTrends: List[UserTrendItem]
    tripTrends: List[TripTrendItem]
