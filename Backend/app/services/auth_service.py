"""Auth service for registration, login, logout, and password reset."""

from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.services import otp_service, token_service
from app.utils.security import hash_password, verify_password, encode_access_token_rs256

MAX_LOGIN_ATTEMPTS = 10


def _login_attempts_key(email: str) -> str:
    return f"login_attempts:{email.lower()}"


async def is_login_locked_out(email: str) -> bool:
    """Check if login is locked out due to failed attempts."""
    from app.redis_client import get_redis
    redis = get_redis()
    key = _login_attempts_key(email)
    count = redis.get(key)
    return int(count) >= MAX_LOGIN_ATTEMPTS if count else False


async def increment_login_attempts(email: str) -> None:
    """Increment login attempt counter with 15min TTL."""
    from app.redis_client import get_redis
    redis = get_redis()
    key = _login_attempts_key(email)
    redis.incr(key)
    redis.expire(key, 15 * 60)


async def clear_login_attempts(email: str) -> None:
    """Clear login attempts on successful login."""
    from app.redis_client import get_redis
    redis = get_redis()
    key = _login_attempts_key(email)
    redis.delete(key)


async def register_user(
    db: AsyncSession,
    data: RegisterRequest,
    avatar_url: str | None = None,
) -> tuple[User, str]:
    """Register a new user after OTP verification."""
    # Check OTP was verified
    if not otp_service.is_verified("register", data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "OTP_NOT_VERIFIED", "message": "OTP verification required"},
        )

    # Check email doesn't exist
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "EMAIL_ALREADY_EXISTS", "message": "Email already registered"},
        )

    # Create user
    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
        city=data.city,
        country=data.country,
        bio=data.bio,
        avatar_url=avatar_url,
        role="user",
        is_banned=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Clear verified marker
    otp_service.clear_verified_marker("register", data.email)

    # Create access token
    access_token = encode_access_token_rs256(
        sub=str(user.id),
        role=user.role,
    )

    return user, access_token


async def login_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> tuple[User, str, str]:
    """Login user, return user, access token, refresh token."""
    # Check login lockout
    if await is_login_locked_out(email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"code": "TOO_MANY_LOGIN_ATTEMPTS", "message": "Too many failed login attempts. Try again later."},
        )

    # Find user
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        await increment_login_attempts(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Email or password is incorrect"},
        )

    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ACCOUNT_BANNED", "message": "Account has been banned"},
        )

    # Verify password
    if not verify_password(password, user.password_hash):
        await increment_login_attempts(email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Email or password is incorrect"},
        )

    # Clear login attempts
    await clear_login_attempts(email)

    # Create tokens
    access_token = encode_access_token_rs256(
        sub=str(user.id),
        role=user.role,
    )
    refresh_token = token_service.create_refresh_token(str(user.id))

    return user, access_token, refresh_token


async def logout_user(refresh_token: str | None) -> None:
    """Logout user by revoking refresh token."""
    if refresh_token:
        token_service.revoke_refresh_token(refresh_token)


async def refresh_access_token(
    db: AsyncSession,
    refresh_token: str | None,
) -> tuple[User, str]:
    """Refresh access token using refresh token."""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "REFRESH_TOKEN_INVALID", "message": "Refresh token required"},
        )

    user_id = token_service.verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "REFRESH_TOKEN_INVALID", "message": "Invalid or expired refresh token"},
        )

    user = await db.get(User, user_id)
    if not user or user.is_banned:
        token_service.revoke_refresh_token(refresh_token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "User not found or banned"},
        )

    # Issue new access token
    access_token = encode_access_token_rs256(
        sub=str(user.id),
        role=user.role,
    )

    return user, access_token


async def reset_password(
    db: AsyncSession,
    reset_token: str,
    new_password: str,
) -> None:
    """Reset user password using reset token."""
    user_id = token_service.verify_reset_token(reset_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "RESET_TOKEN_INVALID", "message": "Invalid or expired reset token"},
        )

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "RESET_TOKEN_INVALID", "message": "User not found"},
        )

    # Update password
    user.password_hash = hash_password(new_password)
    await db.commit()

    # Revoke reset token
    token_service.revoke_reset_token(reset_token)

    # Revoke all refresh tokens for this user (optional security enhancement)
    # For simplicity, we'll just let existing tokens expire


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    """Get user by ID."""
    return await db.get(User, user_id)


async def update_user(
    db: AsyncSession,
    user: User,
    first_name: str | None = None,
    last_name: str | None = None,
    phone: str | None = None,
    city: str | None = None,
    country: str | None = None,
    bio: str | None = None,
    avatar_url: str | None = None,
) -> User:
    """Update user profile."""
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if phone is not None:
        user.phone = phone
    if city is not None:
        user.city = city
    if country is not None:
        user.country = country
    if bio is not None:
        user.bio = bio
    if avatar_url is not None:
        user.avatar_url = avatar_url

    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user: User) -> None:
    """Delete user account."""
    await db.delete(user)
    await db.commit()
