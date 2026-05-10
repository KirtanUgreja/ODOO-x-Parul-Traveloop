"""Token service for opaque refresh tokens stored in Redis."""

import uuid
from typing import Literal

from app.config import settings
from app.redis_client import get_redis


def _refresh_key(token: str) -> str:
    return f"refresh:{token}"


def _reset_token_key(token: str) -> str:
    return f"reset_token:{token}"


def create_refresh_token(user_id: str) -> str:
    """Create opaque refresh token, store in Redis, return token."""
    redis = get_redis()
    token = str(uuid.uuid4())
    key = _refresh_key(token)
    ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    redis.setex(key, ttl, user_id)
    return token


def verify_refresh_token(token: str) -> str | None:
    """Verify refresh token and return user_id if valid."""
    redis = get_redis()
    key = _refresh_key(token)
    user_id = redis.get(key)
    return user_id


def revoke_refresh_token(token: str) -> None:
    """Revoke refresh token by deleting from Redis."""
    redis = get_redis()
    key = _refresh_key(token)
    redis.delete(key)


def create_reset_token(user_id: str) -> str:
    """Create opaque reset token, store in Redis, return token."""
    redis = get_redis()
    token = str(uuid.uuid4())
    key = _reset_token_key(token)
    ttl = settings.RESET_TOKEN_EXPIRE_MINUTES * 60
    redis.setex(key, ttl, user_id)
    return token


def verify_reset_token(token: str) -> str | None:
    """Verify reset token and return user_id if valid."""
    redis = get_redis()
    key = _reset_token_key(token)
    user_id = redis.get(key)
    return user_id


def revoke_reset_token(token: str) -> None:
    """Revoke reset token by deleting from Redis."""
    redis = get_redis()
    key = _reset_token_key(token)
    redis.delete(key)
