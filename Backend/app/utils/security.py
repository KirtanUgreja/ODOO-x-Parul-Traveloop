import time
import uuid
from pathlib import Path

import jwt
from passlib.context import CryptContext

from app.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _read_key(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def encode_access_token_rs256(*, sub: str, role: str) -> str:
    now = int(time.time())
    exp = now + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    payload = {
        "sub": sub,
        "role": role,
        "iss": "traveloop-api",
        "aud": "traveloop-client",
        "iat": now,
        "exp": exp,
        "jti": str(uuid.uuid4()),
    }
    private_key = _read_key(settings.JWT_PRIVATE_KEY_PATH)
    return jwt.encode(payload, private_key, algorithm="RS256")


def decode_access_token_rs256(token: str) -> dict:
    public_key = _read_key(settings.JWT_PUBLIC_KEY_PATH)
    return jwt.decode(
        token,
        public_key,
        algorithms=["RS256"],
        audience="traveloop-client",
        issuer="traveloop-api",
    )
