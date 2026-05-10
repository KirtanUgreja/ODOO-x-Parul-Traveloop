# Traveloop Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full Traveloop backend inside `Backend/` per `Docs/Backend.md` and `Docs/superpowers/specs/2026-05-10-backend-design.md`.

**Architecture:** FastAPI app with thin routers and service-layer business logic. Async SQLAlchemy + Alembic for Postgres persistence. Redis for OTP + refresh tokens. Access token is JWT RS256 only; refresh token is opaque UUID stored in Redis and sent as HttpOnly cookie.

**Tech Stack:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 async, Alembic, asyncpg, redis, passlib[bcrypt], python-jose/pyjwt (RS256), slowapi, pytest, pytest-asyncio, httpx, ruff.

---

## File Map (create/modify)

### Create (Backend)

- `Backend/requirements.txt`
- `Backend/Dockerfile`
- `Backend/docker-compose.yml`
- `Backend/.env.example`
- `Backend/alembic.ini`
- `Backend/alembic/env.py`
- `Backend/app/__init__.py`
- `Backend/app/main.py`
- `Backend/app/config.py`
- `Backend/app/database.py`
- `Backend/app/redis_client.py`
- `Backend/app/dependencies.py`
- `Backend/app/utils/security.py`
- `Backend/app/utils/upload.py`
- `Backend/app/utils/pagination.py`
- `Backend/app/models/*.py` (one per model)
- `Backend/app/schemas/*.py` (one per domain)
- `Backend/app/services/*.py`
- `Backend/app/routers/*.py`
- `Backend/tests/conftest.py`
- `Backend/tests/test_auth.py`
- `Backend/tests/test_trips.py`
- `Backend/tests/test_admin.py`

### Modify

- `Backend/readme.md` (quick start for this backend)

---

## Task 1: Bootstrap Backend Packaging + Tooling

**Files:**
- Create: `Backend/requirements.txt`
- Create: `Backend/.env.example`
- Modify: `Backend/readme.md`

- [ ] **Step 1: Create `Backend/requirements.txt`**

Use pinned-but-flexible versions (avoid overly strict pins for hackathon). Contents:

```txt
fastapi>=0.110
uvicorn[standard]>=0.27
pydantic>=2.6
pydantic-settings>=2.2
sqlalchemy>=2.0
alembic>=1.13
asyncpg>=0.29
redis>=5.0
python-multipart>=0.0.9
passlib[bcrypt]>=1.7
PyJWT>=2.8
slowapi>=0.1.9
python-dotenv>=1.0

pytest>=8.0
pytest-asyncio>=0.23
httpx>=0.27

ruff>=0.5
```

- [ ] **Step 2: Create `Backend/.env.example`**

```env
APP_ENV=development
SECRET_KEY=dev-only
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
RESET_TOKEN_EXPIRE_MINUTES=15
OTP_EXPIRE_MINUTES=10

DATABASE_URL=postgresql+asyncpg://traveloop:traveloop@localhost:5432/traveloop
REDIS_URL=redis://localhost:6379/0

ALLOWED_ORIGINS=http://localhost:3000

UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=5
```

- [ ] **Step 3: Update `Backend/readme.md`**

Add minimal run instructions:

```md
## Local dev

1. `cp .env.example .env` (fill values)
2. `docker-compose up -d db redis`
3. `python -m venv .venv && source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `alembic upgrade head`
6. `uvicorn app.main:app --reload --port 8000`
```

- [ ] **Step 4: Verify**

Run from `Backend/`:

`python -c "import fastapi, sqlalchemy, redis"`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add Backend/requirements.txt Backend/.env.example Backend/readme.md
git commit -m "chore(backend): bootstrap backend dependencies"
```

---

## Task 2: Docker Compose + Dockerfile

**Files:**
- Create: `Backend/docker-compose.yml`
- Create: `Backend/Dockerfile`

- [ ] **Step 1: Create `Backend/docker-compose.yml`**

```yaml
version: "3.9"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: traveloop
      POSTGRES_PASSWORD: traveloop
      POSTGRES_DB: traveloop
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

volumes:
  pgdata:
```

- [ ] **Step 2: Create `Backend/Dockerfile`**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 3: Verify**

From `Backend/`:

`docker-compose up -d --build`

Expected: containers start, api may fail until `app/` exists (ok for now).

- [ ] **Step 4: Commit**

```bash
git add Backend/docker-compose.yml Backend/Dockerfile
git commit -m "chore(backend): add docker compose and api Dockerfile"
```

---

## Task 3: App Config + DB + Redis Isolation

**Files:**
- Create: `Backend/app/__init__.py`
- Create: `Backend/app/config.py`
- Create: `Backend/app/database.py`
- Create: `Backend/app/redis_client.py`

- [ ] **Step 1: Create `Backend/app/config.py`**

```python
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str

    JWT_PRIVATE_KEY_PATH: str
    JWT_PUBLIC_KEY_PATH: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES: int = 15
    OTP_EXPIRE_MINUTES: int = 10

    DATABASE_URL: str
    REDIS_URL: str

    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    class Config:
        env_file = ".env"


settings = Settings()
```

- [ ] **Step 2: Create `Backend/app/database.py`**

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.config import settings


engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


def get_session() -> async_sessionmaker[AsyncSession]:
    return SessionLocal
```

- [ ] **Step 3: Create `Backend/app/redis_client.py`**

```python
import redis
from app.config import settings


def get_redis() -> redis.Redis:
    return redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
```

- [ ] **Step 4: Verify import boundary**

Run from `Backend/`:

`python -c "from app.database import get_session; from app.redis_client import get_redis"`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add Backend/app/__init__.py Backend/app/config.py Backend/app/database.py Backend/app/redis_client.py
git commit -m "chore(backend): add settings, db, and redis clients"
```

---

## Task 4: Alembic Base Wiring

**Files:**
- Create: `Backend/alembic.ini`
- Create: `Backend/alembic/env.py`

- [ ] **Step 1: Create `Backend/alembic.ini`**

```ini
[alembic]
script_location = alembic
sqlalchemy.url = driver://user:pass@localhost/dbname

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

- [ ] **Step 2: Create `Backend/alembic/env.py`**

```python
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.config import settings
from app.models.base import Base


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = settings.DATABASE_URL.replace("+asyncpg", "")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = settings.DATABASE_URL.replace("+asyncpg", "")
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio

    asyncio.run(run_migrations_online())
```

- [ ] **Step 3: Verify**

From `Backend/`:

`python -c "import alembic"`

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add Backend/alembic.ini Backend/alembic/env.py
git commit -m "chore(backend): wire alembic configuration"
```

---

## Task 5: Models Base + Core Models (User, City, ActivityCatalog)

**Files:**
- Create: `Backend/app/models/base.py`
- Create: `Backend/app/models/user.py`
- Create: `Backend/app/models/city.py`
- Create: `Backend/app/models/activity_catalog.py`

- [ ] **Step 1: Create `Backend/app/models/base.py`**

```python
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
```

- [ ] **Step 2: Create `Backend/app/models/user.py`**

```python
import uuid
from sqlalchemy import Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    is_banned = Column(Boolean, nullable=False, default=False)

    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
```

- [ ] **Step 3: Create `Backend/app/models/city.py`**

```python
import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
```

- [ ] **Step 4: Create `Backend/app/models/activity_catalog.py`**

```python
import uuid
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class ActivityCatalog(Base):
    __tablename__ = "activity_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=True)
    tags = Column(String, nullable=True)
```

- [ ] **Step 5: Create initial migration**

Run from `Backend/`:

`alembic revision --autogenerate -m "create core tables"`

Expected: new file under `Backend/alembic/versions/`.

- [ ] **Step 6: Apply migration**

Run:

`alembic upgrade head`

Expected: success.

- [ ] **Step 7: Commit**

```bash
git add Backend/app/models Backend/alembic/versions
git commit -m "feat(backend): add core models and initial migration"
```

---

## Task 6: Utilities (security, upload, pagination)

**Files:**
- Create: `Backend/app/utils/security.py`
- Create: `Backend/app/utils/upload.py`
- Create: `Backend/app/utils/pagination.py`

- [ ] **Step 1: Create `Backend/app/utils/security.py`**

```python
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
```

- [ ] **Step 2: Create `Backend/app/utils/upload.py`**

```python
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.config import settings


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def save_upload(file: UploadFile, folder: str) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, detail={"code": "INVALID_FILE_TYPE", "message": "Invalid file type"})

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(400, detail={"code": "FILE_TOO_LARGE", "message": "File too large"})

    ext = (file.filename or "").split(".")[-1] or "bin"
    filename = f"{uuid.uuid4()}.{ext}"
    dest = Path(settings.UPLOAD_DIR) / folder / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(contents)
    return f"/uploads/{folder}/{filename}"
```

- [ ] **Step 3: Create `Backend/app/utils/pagination.py`**

```python
from sqlalchemy import func, select


async def paginate(query, db, page: int, limit: int):
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()
    items = (await db.execute(query.offset((page - 1) * limit).limit(limit))).scalars().all()
    total_pages = -(-total // limit)
    return items, total, total_pages
```

- [ ] **Step 4: Commit**

```bash
git add Backend/app/utils
git commit -m "feat(backend): add security, upload, and pagination utilities"
```

---

## Task 7: FastAPI App Skeleton + Error Envelope + RequestId

**Files:**
- Create: `Backend/app/main.py`
- Create: `Backend/app/routers/__init__.py`

- [ ] **Step 1: Create `Backend/app/main.py`**

```python
import datetime as dt
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.routers import api_router


limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


def create_app() -> FastAPI:
    openapi_url = None if settings.APP_ENV == "production" else "/openapi.json"
    docs_url = None if settings.APP_ENV == "production" else "/docs"
    redoc_url = None if settings.APP_ENV == "production" else "/redoc"

    app = FastAPI(openapi_url=openapi_url, docs_url=docs_url, redoc_url=redoc_url)
    app.state.limiter = limiter

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"] ,
        allow_headers=["*"],
    )
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request.state.request_id = f"req_{uuid.uuid4().hex[:12]}"
        return await call_next(request)

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "error": {
                    "code": "TOO_MANY_REQUESTS",
                    "message": "Too many requests",
                    "requestId": getattr(request.state, "request_id", None),
                    "timestamp": dt.datetime.utcnow().isoformat() + "Z",
                }
            },
        )

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
```

- [ ] **Step 2: Create `Backend/app/routers/__init__.py`**

```python
from fastapi import APIRouter


api_router = APIRouter()
```

- [ ] **Step 3: Verify**

From `Backend/`:

`python -c "from app.main import app; print(app.title)"`

Expected: prints default title.

- [ ] **Step 4: Commit**

```bash
git add Backend/app/main.py Backend/app/routers/__init__.py
git commit -m "feat(backend): add FastAPI app skeleton and requestId envelope"
```

---

## Task 8: DB Dependency + Auth Dependencies

**Files:**
- Create: `Backend/app/dependencies.py`
- Modify: `Backend/app/routers/__init__.py`

- [ ] **Step 1: Create `Backend/app/dependencies.py`**

```python
from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models.user import User
from app.utils.security import decode_access_token_rs256


async def get_db() -> AsyncSession:
    async_session = get_session()
    async with async_session() as session:
        yield session


async def get_current_user(
    request: Request,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_access_token_rs256(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid token", "requestId": request.state.request_id},
        )

    user = await db.get(User, payload["sub"])
    if not user or user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Unauthorized", "requestId": request.state.request_id},
        )
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "Admin access required"})
    return user
```

- [ ] **Step 2: Commit**

```bash
git add Backend/app/dependencies.py
git commit -m "feat(backend): add db and auth dependencies"
```

---

## Task 9: Auth Services + Auth Router (send-otp, verify-otp, register, login, refresh, logout, me)

**Files:**
- Create: `Backend/app/services/otp_service.py`
- Create: `Backend/app/services/token_service.py`
- Create: `Backend/app/services/auth_service.py`
- Create: `Backend/app/routers/auth.py`
- Modify: `Backend/app/routers/__init__.py`
- Create: `Backend/app/schemas/auth.py`
- Test: `Backend/tests/test_auth.py`

- [ ] **Step 1: Write failing tests (`Backend/tests/test_auth.py`)**

```python
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_send_otp_returns_envelope(async_client: AsyncClient):
    r = await async_client.post("/api/v1/auth/send-otp", json={"email": "a@example.com", "purpose": "register"})
    assert r.status_code in (200, 400, 429)
    body = r.json()
    assert "data" in body or "error" in body


@pytest.mark.asyncio
async def test_refresh_requires_cookie(async_client: AsyncClient):
    r = await async_client.post("/api/v1/auth/refresh")
    assert r.status_code == 401
    assert r.json()["error"]["code"] in ("REFRESH_TOKEN_INVALID", "UNAUTHORIZED")
```

- [ ] **Step 2: Run tests to see failure**

Run from `Backend/`:

`pytest -q`

Expected: FAIL (no app wiring / fixtures yet).

- [ ] **Step 3: Implement fixtures (`Backend/tests/conftest.py`)**

```python
import os
import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def async_client():
    os.environ.setdefault("APP_ENV", "test")
    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
```

- [ ] **Step 4: Implement schemas + services + router**

Implement per `Docs/Backend.md`:

- OTP stored in Redis as bcrypt hash
- OTP attempts max 5, lockout until TTL expiry
- Register requires verified OTP (store a short-lived Redis marker `otp_verified:{purpose}:{email}` TTL 10m)
- Login sets refresh cookie, returns access token + user
- Refresh reads cookie, validates Redis key `refresh:{uuid}`, issues new access token
- Logout deletes redis refresh key and clears cookie

Key implementation details (must match design):

- Refresh token is opaque UUID only.
- JWT code only in `utils/security.py`.
- Routers thin.

- [ ] **Step 5: Run tests**

`pytest Backend/tests/test_auth.py -q`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add Backend/app/services Backend/app/routers Backend/app/schemas Backend/tests
git commit -m "feat(backend): implement auth with otp and refresh cookie"
```

---

## Task 10: Trip Domain (models + services + routers + tests)

**Files:**
- Create: `Backend/app/models/trip.py`
- Create: `Backend/app/models/section.py`
- Create: `Backend/app/models/section_activity.py`
- Create: `Backend/app/services/trip_service.py`
- Create: `Backend/app/services/section_service.py`
- Create: `Backend/app/services/activity_service.py`
- Create: `Backend/app/routers/trips.py`
- Create: `Backend/app/routers/sections.py`
- Create: `Backend/app/routers/activities.py`
- Create: `Backend/app/schemas/trip.py`
- Create: `Backend/app/schemas/section.py`
- Create: `Backend/app/schemas/activity.py`
- Test: `Backend/tests/test_trips.py`

- [ ] **Step 1: Write failing test for ownership**

```python
import pytest


@pytest.mark.asyncio
async def test_trip_requires_auth(async_client):
    r = await async_client.get("/api/v1/trips")
    assert r.status_code == 422 or r.status_code == 401
```

- [ ] **Step 2: Implement models + migration**

Use `Trip.user_id -> User.id`, `Section.trip_id -> Trip.id`, `SectionActivity.section_id -> Section.id`.
Add `sort_order` for section/activity.

Run:

`alembic revision --autogenerate -m "add trip section activity"`

Apply:

`alembic upgrade head`

- [ ] **Step 3: Implement `verify_trip_owner` in `trip_service.py`**

```python
async def verify_trip_owner(trip_id, user_id, db):
    trip = await db.get(Trip, trip_id)
    if not trip:
        raise NotFound
    if trip.user_id != user_id:
        raise OwnershipRequired
    return trip
```

- [ ] **Step 4: Implement CRUD endpoints**

Implement list/create/get/patch/delete for trips; list/create/patch/delete for sections + reorder; list/create/patch/delete for activities.

- [ ] **Step 5: Run tests**

`pytest Backend/tests/test_trips.py -q`

- [ ] **Step 6: Commit**

```bash
git add Backend/app/models Backend/app/services Backend/app/routers Backend/app/schemas Backend/alembic/versions Backend/tests/test_trips.py
git commit -m "feat(backend): add trips, sections, and activities"
```

---

## Task 11: Budget + Invoice

**Files:**
- Create: `Backend/app/models/budget_item.py`
- Create: `Backend/app/models/invoice.py`
- Create: `Backend/app/services/budget_service.py`
- Create: `Backend/app/services/invoice_service.py`
- Create: `Backend/app/routers/budget.py`
- Create: `Backend/app/schemas/budget.py`

- [ ] **Step 1: Migration**

`alembic revision --autogenerate -m "add budget and invoice"`

`alembic upgrade head`

- [ ] **Step 2: Implement endpoints**

Match contract:

- `GET /trips/:id/budget`
- `POST/PATCH/DELETE /trips/:id/budget/items`
- `GET /trips/:id/invoice` (compute totals from budget items)
- `PATCH /trips/:id/invoice/status`

- [ ] **Step 3: Commit**

```bash
git add Backend/app/models Backend/app/services Backend/app/routers Backend/app/schemas Backend/alembic/versions
git commit -m "feat(backend): add budget items and invoice endpoints"
```

---

## Task 12: Checklist + Notes

**Files:**
- Create: `Backend/app/models/checklist_item.py`
- Create: `Backend/app/models/note.py`
- Create: `Backend/app/services/checklist_service.py`
- Create: `Backend/app/services/note_service.py`
- Create: `Backend/app/routers/checklist.py`
- Create: `Backend/app/routers/notes.py`
- Create: `Backend/app/schemas/checklist.py`
- Create: `Backend/app/schemas/note.py`

- [ ] **Step 1: Migration**

`alembic revision --autogenerate -m "add checklist and notes"`

`alembic upgrade head`

- [ ] **Step 2: Implement endpoints**

Checklist:

- `GET /trips/:id/checklist`
- `POST/PATCH/DELETE /trips/:id/checklist/items`
- `DELETE /trips/:id/checklist/reset`
- `POST /trips/:id/checklist/share` (if required; otherwise return placeholder token but still model `SharedTrip` in Task 13)

Notes:

- `GET/POST/PATCH/DELETE /trips/:id/notes`

- [ ] **Step 3: Commit**

```bash
git add Backend/app/models Backend/app/services Backend/app/routers Backend/app/schemas Backend/alembic/versions
git commit -m "feat(backend): add checklist and notes"
```

---

## Task 13: Sharing + Community + Saved Cities

**Files:**
- Create: `Backend/app/models/shared_trip.py`
- Create: `Backend/app/models/saved_city.py`
- Create: `Backend/app/models/community_trip.py`
- Create: `Backend/app/services/share_service.py`
- Create: `Backend/app/services/community_service.py`
- Create: `Backend/app/services/saved_service.py`
- Create: `Backend/app/routers/community.py`
- Create: `Backend/app/routers/users.py`
- Create: `Backend/app/schemas/community.py`
- Create: `Backend/app/schemas/user.py`

- [ ] **Step 1: Migration**

`alembic revision --autogenerate -m "add sharing community saved"`

`alembic upgrade head`

- [ ] **Step 2: Implement endpoints**

- `POST /trips/:id/share` -> create `SharedTrip.token`
- `GET /trips/share/:token` -> public read shared trip summary
- `GET /community` public list
- `POST /community/:tripId/copy` bearer copy trip into user account
- `GET /users/:id/saved` bearer
- `POST /users/:id/saved` bearer
- `DELETE /users/:id/saved/:cid` bearer

- [ ] **Step 3: Commit**

```bash
git add Backend/app/models Backend/app/services Backend/app/routers Backend/app/schemas Backend/alembic/versions
git commit -m "feat(backend): add sharing, community, and saved cities"
```

---

## Task 14: Admin Endpoints + Analytics

**Files:**
- Create: `Backend/app/routers/admin.py`
- Create: `Backend/app/services/admin_service.py`
- Create: `Backend/app/schemas/admin.py`
- Test: `Backend/tests/test_admin.py`

- [ ] **Step 1: Write failing test**

```python
import pytest


@pytest.mark.asyncio
async def test_admin_requires_admin(async_client):
    r = await async_client.get("/api/v1/admin/stats")
    assert r.status_code in (401, 403, 422)
```

- [ ] **Step 2: Implement endpoints**

Per `Docs/Backend.md`:

- `GET /admin/stats`
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `DELETE /admin/users/:id`
- `GET /admin/trips`
- `GET /admin/analytics`

Use `require_admin` dependency.

- [ ] **Step 3: Run tests**

`pytest Backend/tests/test_admin.py -q`

- [ ] **Step 4: Commit**

```bash
git add Backend/app/routers/admin.py Backend/app/services/admin_service.py Backend/app/schemas/admin.py Backend/tests/test_admin.py
git commit -m "feat(backend): add admin endpoints"
```

---

## Task 15: Wiring Routers Into API Router

**Files:**
- Modify: `Backend/app/routers/__init__.py`

- [ ] **Step 1: Include routers**

```python
from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.trips import router as trips_router
from app.routers.sections import router as sections_router
from app.routers.activities import router as activities_router
from app.routers.budget import router as budget_router
from app.routers.checklist import router as checklist_router
from app.routers.notes import router as notes_router
from app.routers.cities import router as cities_router
from app.routers.community import router as community_router
from app.routers.users import router as users_router
from app.routers.admin import router as admin_router


api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(trips_router, prefix="/trips", tags=["trips"])
api_router.include_router(sections_router, prefix="/trips", tags=["sections"])
api_router.include_router(activities_router, prefix="/trips", tags=["activities"])
api_router.include_router(budget_router, prefix="/trips", tags=["budget"])
api_router.include_router(checklist_router, prefix="/trips", tags=["checklist"])
api_router.include_router(notes_router, prefix="/trips", tags=["notes"])
api_router.include_router(cities_router, prefix="/cities", tags=["cities"])
api_router.include_router(community_router, prefix="/community", tags=["community"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
```

- [ ] **Step 2: Verify app starts**

From `Backend/`:

`uvicorn app.main:app --reload --port 8000`

Expected: server starts.

- [ ] **Step 3: Commit**

```bash
git add Backend/app/routers/__init__.py
git commit -m "chore(backend): wire api routers"
```

---

## Task 16: Final Verification

**Files:**
- None

- [ ] **Step 1: Run full test suite**

From `Backend/`:

`pytest -q`

Expected: PASS.

- [ ] **Step 2: Lint**

`ruff check Backend/app Backend/tests`

Expected: no errors.

- [ ] **Step 3: Commit (if lint fixes changed files)**

```bash
git add Backend/app Backend/tests
git commit -m "chore(backend): fix lint"
```

---

## Self-Review (plan vs spec)

- Spec coverage: tasks cover utilities layer, isolated core files, auth (opaque refresh, OTP lockout), ownership checks in services, domain models (including SharedTrip/SavedCity/CommunityTrip/Invoice), OWASP items, and required endpoints.
- Placeholder scan: no TODO/TBD markers; each task has file paths and commands.
- Type consistency: access token helpers defined in `utils/security.py` and referenced by dependencies; refresh token explicitly opaque UUID stored in Redis.
