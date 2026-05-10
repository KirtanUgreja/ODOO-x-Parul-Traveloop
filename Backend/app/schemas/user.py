from pydantic import BaseModel
from typing import Optional


class UserProfileResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    city: Optional[str]
    country: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True


class SavedCityResponse(BaseModel):
    id: str
    user_id: str
    city_id: str
    city_name: Optional[str] = None
    city_country: Optional[str] = None

    class Config:
        from_attributes = True


class SavedCityListResponse(BaseModel):
    data: list[SavedCityResponse]
