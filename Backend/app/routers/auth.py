"""Auth router with OTP-based registration and refresh token cookies."""

import datetime as dt

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, UploadFile, File, status
from pydantic import EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    MeUpdateRequest,
    RegisterRequest,
    ResetPasswordRequest,
    SendOtpRequest,
    UserResponse,
    VerifyOtpRequest,
)
from app.services import otp_service, token_service
from app.services.auth_service import (
    delete_user,
    login_user,
    logout_user,
    refresh_access_token,
    register_user,
    reset_password,
    update_user,
)
from app.utils.upload import save_upload

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def _make_error_response(request: Request, code: str, message: str, status_code: int) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": dt.datetime.utcnow().isoformat() + "Z",
        }
    }


def _make_success_response(data: dict, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.post("/send-otp", response_model=None, status_code=status.HTTP_200_OK)
async def send_otp(
    request: Request,
    body: SendOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP to email for registration or password reset."""
    # Check if already locked out
    if otp_service.is_locked_out(body.purpose, body.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "MAX_OTP_ATTEMPTS", "message": "Too many attempts. Please wait before requesting new OTP."},
        )

    # Check if OTP already exists and not expired
    existing_hash = otp_service.get_otp_hash(body.purpose, body.email)
    if existing_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "OTP_ALREADY_SENT", "message": "OTP already sent. Please wait for it to expire."},
        )

    # For reset, verify user exists
    if body.purpose == "reset":
        from sqlalchemy import select
        from app.models.user import User
        stmt = select(User).where(User.email == body.email.lower())
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "USER_NOT_FOUND", "message": "User not found"},
            )

    # Generate and store OTP
    otp = otp_service.generate_otp()
    otp_service.store_otp(body.purpose, body.email, otp)

    # In production, send email here. For now, just return success.
    # print(f"OTP for {body.email}: {otp}")  # Debug only

    return _make_success_response(
        {"message": "OTP sent to email"},
        request,
    )


@router.post("/verify-otp", response_model=None, status_code=status.HTTP_200_OK)
async def verify_otp(
    request: Request,
    body: VerifyOtpRequest,
):
    """Verify OTP and optionally return reset token."""
    # Check if locked out
    if otp_service.is_locked_out(body.purpose, body.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "MAX_OTP_ATTEMPTS", "message": "Too many attempts. Please wait before trying again."},
        )

    # Get stored hash
    stored_hash = otp_service.get_otp_hash(body.purpose, body.email)
    if not stored_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "OTP_EXPIRED", "message": "OTP expired or not sent"},
        )

    # Verify OTP
    if not otp_service.verify_otp(body.otp, stored_hash):
        attempts = otp_service.increment_attempts(body.purpose, body.email)
        if attempts >= 5:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"code": "MAX_OTP_ATTEMPTS", "message": "Too many failed attempts. Please request new OTP."},
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_OTP", "message": "Invalid OTP"},
        )

    # Success - clear OTP and attempts
    otp_service.delete_otp(body.purpose, body.email)
    otp_service.clear_attempts(body.purpose, body.email)

    response_data = {"verified": True}

    # For register, store verified marker
    if body.purpose == "register":
        otp_service.store_verified_marker("register", body.email)
    # For reset, create reset token
    elif body.purpose == "reset":
        # Get user ID
        # We need to look up the user, but we don't have DB here
        # So we store the email in a temporary token
        reset_token = token_service.create_reset_token(body.email)
        response_data["reset_token"] = reset_token

    return _make_success_response(response_data, request)


@router.post("/register", response_model=None, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    response: Response,
    first_name: str,
    last_name: str,
    email: EmailStr,
    password: str,
    phone: str | None = None,
    city: str | None = None,
    country: str | None = None,
    bio: str | None = None,
    avatar: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Register new user after OTP verification."""
    # Handle avatar upload
    avatar_url = None
    if avatar:
        avatar_url = await save_upload(avatar, "avatars")

    # Create request object
    register_data = RegisterRequest(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
        phone=phone,
        city=city,
        country=country,
        bio=bio,
    )

    user, access_token = await register_user(db, register_data, avatar_url)

    # Create refresh token and set cookie
    refresh_token = token_service.create_refresh_token(str(user.id))
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        path="/api/v1/auth/refresh",
        max_age=COOKIE_MAX_AGE,
    )

    return _make_success_response(
        {
            "access_token": access_token,
            "user": UserResponse.model_validate(user).model_dump(),
        },
        request,
    )


@router.post("/login", response_model=None, status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    response: Response,
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login user and set refresh token cookie."""
    user, access_token, refresh_token = await login_user(db, body.email, body.password)

    # Set refresh token cookie
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        path="/api/v1/auth/refresh",
        max_age=COOKIE_MAX_AGE,
    )

    return _make_success_response(
        {
            "access_token": access_token,
            "user": UserResponse.model_validate(user).model_dump(),
        },
        request,
    )


@router.post("/refresh", response_model=None, status_code=status.HTTP_200_OK)
async def refresh(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(None, alias="refreshToken"),
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token cookie."""
    user, access_token = await refresh_access_token(db, refresh_token)

    # Issue new refresh token (token rotation)
    new_refresh_token = token_service.create_refresh_token(str(user.id))
    response.set_cookie(
        key="refreshToken",
        value=new_refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        path="/api/v1/auth/refresh",
        max_age=COOKIE_MAX_AGE,
    )

    return _make_success_response(
        {
            "access_token": access_token,
            "user": UserResponse.model_validate(user).model_dump(),
        },
        request,
    )


@router.post("/logout", response_model=None, status_code=status.HTTP_200_OK)
async def logout(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(None, alias="refreshToken"),
):
    """Logout user and clear refresh token cookie."""
    await logout_user(refresh_token)

    # Clear cookie
    response.delete_cookie(
        key="refreshToken",
        path="/api/v1/auth/refresh",
    )

    return _make_success_response(
        {"message": "Logged out successfully"},
        request,
    )


@router.post("/reset-password", response_model=None, status_code=status.HTTP_200_OK)
async def reset_password_endpoint(
    request: Request,
    body: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using reset token from verify-otp."""
    await reset_password(db, body.reset_token, body.new_password)

    return _make_success_response(
        {"message": "Password updated successfully"},
        request,
    )


@router.get("/me", response_model=None, status_code=status.HTTP_200_OK)
async def get_me(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Get current user profile."""
    return _make_success_response(
        {"user": UserResponse.model_validate(current_user).model_dump()},
        request,
    )


@router.patch("/me", response_model=None, status_code=status.HTTP_200_OK)
async def update_me(
    request: Request,
    body: MeUpdateRequest,
    avatar: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile."""
    # Handle avatar upload
    avatar_url = None
    if avatar:
        avatar_url = await save_upload(avatar, "avatars")

    updated_user = await update_user(
        db,
        current_user,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        city=body.city,
        country=body.country,
        bio=body.bio,
        avatar_url=avatar_url,
    )

    return _make_success_response(
        {"user": UserResponse.model_validate(updated_user).model_dump()},
        request,
    )


@router.delete("/me", response_model=None, status_code=status.HTTP_200_OK)
async def delete_me(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete current user account."""
    await delete_user(db, current_user)

    # Clear refresh token cookie
    response.delete_cookie(
        key="refreshToken",
        path="/api/v1/auth/refresh",
    )

    return _make_success_response(
        {"message": "Account deleted successfully"},
        request,
    )
