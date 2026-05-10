from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str | None
    city: str | None
    country: str | None
    bio: str | None
    avatar_url: str | None
    role: str

    class Config:
        from_attributes = True


class SendOtpRequest(BaseModel):
    email: EmailStr
    purpose: Literal["register", "reset"] = "register"


class SendOtpResponse(BaseModel):
    message: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    purpose: Literal["register", "reset"] = "register"


class VerifyOtpResponse(BaseModel):
    verified: bool
    reset_token: str | None = None


class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: str | None = None
    city: str | None = None
    country: str | None = None
    bio: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse


class RefreshResponse(BaseModel):
    access_token: str
    user: UserResponse


class LogoutResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=8)


class ResetPasswordResponse(BaseModel):
    message: str


class MeUpdateRequest(BaseModel):
    first_name: str | None = Field(None, min_length=1)
    last_name: str | None = Field(None, min_length=1)
    phone: str | None = None
    city: str | None = None
    country: str | None = None
    bio: str | None = None
