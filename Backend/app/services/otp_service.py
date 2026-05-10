"""OTP service with bcrypt hashed storage and attempt tracking."""

import random
from typing import Literal

import bcrypt

from app.config import settings
from app.redis_client import get_redis

MAX_OTP_ATTEMPTS = 5


def _otp_key(purpose: Literal["register", "reset"], email: str) -> str:
    return f"otp:{purpose}:{email.lower()}"


def _otp_attempts_key(purpose: Literal["register", "reset"], email: str) -> str:
    return f"otp_attempts:{purpose}:{email.lower()}"


def _verified_marker_key(purpose: Literal["register", "reset"], email: str) -> str:
    return f"otp_verified:{purpose}:{email.lower()}"


def generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP."""
    return "".join(random.choices("0123456789", k=length))


def hash_otp(otp: str) -> str:
    """Hash OTP using bcrypt."""
    # bcrypt has 72 byte limit, OTP is always 6 digits so well within limit
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(otp.encode(), salt).decode()


def verify_otp(plain: str, hashed: str) -> bool:
    """Verify OTP against bcrypt hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def store_otp(purpose: Literal["register", "reset"], email: str, otp: str) -> None:
    """Store hashed OTP in Redis with TTL."""
    redis = get_redis()
    key = _otp_key(purpose, email)
    hashed = hash_otp(otp)
    ttl = settings.OTP_EXPIRE_MINUTES * 60
    redis.setex(key, ttl, hashed)


def get_otp_hash(purpose: Literal["register", "reset"], email: str) -> str | None:
    """Get stored OTP hash from Redis."""
    redis = get_redis()
    key = _otp_key(purpose, email)
    return redis.get(key)


def delete_otp(purpose: Literal["register", "reset"], email: str) -> None:
    """Delete OTP from Redis."""
    redis = get_redis()
    key = _otp_key(purpose, email)
    redis.delete(key)


def increment_attempts(purpose: Literal["register", "reset"], email: str) -> int:
    """Increment OTP attempt counter."""
    redis = get_redis()
    key = _otp_attempts_key(purpose, email)
    ttl = settings.OTP_EXPIRE_MINUTES * 60
    count = redis.incr(key)
    redis.expire(key, ttl)
    return count


def get_attempts(purpose: Literal["register", "reset"], email: str) -> int:
    """Get current attempt count."""
    redis = get_redis()
    key = _otp_attempts_key(purpose, email)
    count = redis.get(key)
    return int(count) if count else 0


def is_locked_out(purpose: Literal["register", "reset"], email: str) -> bool:
    """Check if user is locked out due to max attempts."""
    return get_attempts(purpose, email) >= MAX_OTP_ATTEMPTS


def clear_attempts(purpose: Literal["register", "reset"], email: str) -> None:
    """Clear attempt counter (on successful verification)."""
    redis = get_redis()
    key = _otp_attempts_key(purpose, email)
    redis.delete(key)


def store_verified_marker(purpose: Literal["register", "reset"], email: str) -> None:
    """Store verified marker in Redis."""
    redis = get_redis()
    key = _verified_marker_key(purpose, email)
    ttl = settings.OTP_EXPIRE_MINUTES * 60
    redis.setex(key, ttl, "1")


def is_verified(purpose: Literal["register", "reset"], email: str) -> bool:
    """Check if OTP was verified for this purpose and email."""
    redis = get_redis()
    key = _verified_marker_key(purpose, email)
    return redis.exists(key) > 0


def clear_verified_marker(purpose: Literal["register", "reset"], email: str) -> None:
    """Clear verified marker."""
    redis = get_redis()
    key = _verified_marker_key(purpose, email)
    redis.delete(key)
