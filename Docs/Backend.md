# Traveloop — Backend Specification
> Stack: **Python 3.11+** · **FastAPI** · **SQLAlchemy (async)** · **Alembic** · **JWT (RS256)** · **Redis (OTP TTL)** · **Docker Compose**
> Hand this file to a backend engineer or AI agent to implement.

---

## 1. TECH STACK

| Concern | Tool |
|---|---|
| Language | Python 3.11+ |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Database | PostgreSQL 15 (Docker) |
| Cache / OTP Store | Redis 7 (Docker) |
| Auth | JWT RS256 (access 15min) + opaque refresh token (HttpOnly cookie, 7d) |
| OTP | 6-digit numeric, stored in Redis with 10-min TTL |
| Password Hashing | bcrypt (passlib) |
| Validation | Pydantic v2 |
| File Upload | python-multipart + local /uploads or S3-compatible |
| Testing | pytest + pytest-asyncio + httpx |
| Linting | ruff + mypy |
| Hosting | Railway / Render |

---

## 2. ENVIRONMENT VARIABLES (.env)

```env
# App
APP_ENV=development
SECRET_KEY=your_random_secret_for_misc
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
RESET_TOKEN_EXPIRE_MINUTES=15
OTP_EXPIRE_MINUTES=10

# Database
DATABASE_URL=postgresql+asyncpg://traveloop:traveloop@localhost:5432/traveloop

# Redis (OTP + refresh token blocklist)
REDIS_URL=redis://localhost:6379/0

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app

# File Upload
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=5
```

---

## 3. PROJECT STRUCTURE

```
traveloop-backend/
├── app/
│   ├── main.py                   ← FastAPI app init, middleware, router include
│   ├── config.py                 ← Settings (pydantic-settings)
│   ├── database.py               ← Async engine, session factory
│   ├── redis_client.py           ← Redis connection
│   ├── dependencies.py           ← get_db, get_current_user, require_admin
│   ├── models/                   ← SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── trip.py
│   │   ├── section.py
│   │   ├── activity.py
│   │   ├── checklist.py
│   │   ├── note.py
│   │   ├── budget.py
│   │   └── city.py
│   ├── schemas/                  ← Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── trip.py
│   │   ├── section.py
│   │   ├── activity.py
│   │   ├── checklist.py
│   │   ├── note.py
│   │   ├── budget.py
│   │   ├── city.py
│   │   └── common.py             ← PaginatedResponse, ErrorResponse, Meta
│   ├── routers/                  ← FastAPI APIRouter per domain
│   │   ├── auth.py
│   │   ├── trips.py
│   │   ├── sections.py
│   │   ├── activities.py
│   │   ├── budget.py
│   │   ├── checklist.py
│   │   ├── notes.py
│   │   ├── cities.py
│   │   ├── community.py
│   │   ├── users.py
│   │   └── admin.py
│   ├── services/                 ← Business logic (called by routers)
│   │   ├── auth_service.py
│   │   ├── otp_service.py
│   │   ├── token_service.py
│   │   ├── trip_service.py
│   │   ├── budget_service.py
│   │   └── admin_service.py
│   └── utils/
│       ├── security.py           ← bcrypt, JWT encode/decode
│       ├── pagination.py         ← paginate() helper
│       └── upload.py             ← save_upload(), validate_image()
├── alembic/
│   ├── env.py
│   └── versions/
├── keys/
│   ├── private.pem               ← RS256 private key (git-ignored)
│   └── public.pem                ← RS256 public key
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_trips.py
│   └── test_admin.py
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── alembic.ini
```

---

## 4. DOCKER COMPOSE

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

---

## 5. AUTH SYSTEM

### 5A. JWT RS256 Token Design

```python
# Access Token payload (JWT, RS256, 15-min expiry)
{
  "sub": "user-uuid",
  "role": "user" | "admin",
  "iss": "traveloop-api",
  "aud": "traveloop-client",
  "exp": <timestamp>,
  "iat": <timestamp>,
  "jti": "unique-token-id"   # for blocklist if needed
}

# Refresh Token: opaque UUID stored in Redis
# Key:   refresh:{token_uuid}
# Value: user_id
# TTL:   7 days
```

### 5B. OTP System (Redis)

```python
# OTP Storage in Redis:
# Key:   otp:{purpose}:{email}       e.g. otp:register:user@email.com
# Value: hashed_otp_code             (bcrypt hash of 6-digit string)
# TTL:   600 seconds (10 minutes)

# Attempt counter (brute-force protection):
# Key:   otp_attempts:{purpose}:{email}
# Value: attempt_count (int)
# TTL:   600 seconds
# Max:   5 attempts → lock out

# Reset token (after OTP verify for password reset):
# Key:   reset_token:{token_uuid}
# Value: user_id
# TTL:   900 seconds (15 minutes)
```

### 5C. Password Hashing

```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

### 5D. Security Middleware Stack

```python
# In main.py:
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter                   # rate limiting
from slowapi.util import get_remote_address

app.add_middleware(CORSMiddleware,
  allow_origins=settings.ALLOWED_ORIGINS,
  allow_credentials=True,                    # required for HttpOnly cookie
  allow_methods=["*"],
  allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
```

---

## 6. FULL API CONTRACT (identical to frontend.md)

### Auth Endpoints

```
POST   /api/v1/auth/send-otp           public
POST   /api/v1/auth/verify-otp         public
POST   /api/v1/auth/register           public
POST   /api/v1/auth/login              public
POST   /api/v1/auth/logout             bearer
POST   /api/v1/auth/refresh            cookie
POST   /api/v1/auth/reset-password     public
GET    /api/v1/auth/me                 bearer
PATCH  /api/v1/auth/me                 bearer
DELETE /api/v1/auth/me                 bearer
```

### Trips
```
GET    /api/v1/trips                   bearer
POST   /api/v1/trips                   bearer
GET    /api/v1/trips/:id               bearer
PATCH  /api/v1/trips/:id               bearer
DELETE /api/v1/trips/:id               bearer
POST   /api/v1/trips/:id/share         bearer
GET    /api/v1/trips/share/:token      public
```

### Sections
```
GET    /api/v1/trips/:id/sections              bearer
POST   /api/v1/trips/:id/sections              bearer
PATCH  /api/v1/trips/:id/sections/:sid         bearer
DELETE /api/v1/trips/:id/sections/:sid         bearer
PATCH  /api/v1/trips/:id/sections/reorder      bearer
```

### Section Activities
```
GET    /api/v1/trips/:id/sections/:sid/activities          bearer
POST   /api/v1/trips/:id/sections/:sid/activities          bearer
PATCH  /api/v1/trips/:id/sections/:sid/activities/:aid     bearer
DELETE /api/v1/trips/:id/sections/:sid/activities/:aid     bearer
```

### Budget & Invoice
```
GET    /api/v1/trips/:id/budget                 bearer
POST   /api/v1/trips/:id/budget/items           bearer
PATCH  /api/v1/trips/:id/budget/items/:bid      bearer
DELETE /api/v1/trips/:id/budget/items/:bid      bearer
GET    /api/v1/trips/:id/invoice                bearer
PATCH  /api/v1/trips/:id/invoice/status         bearer
```

### Checklist
```
GET    /api/v1/trips/:id/checklist                    bearer
POST   /api/v1/trips/:id/checklist/items              bearer
PATCH  /api/v1/trips/:id/checklist/items/:cid         bearer
DELETE /api/v1/trips/:id/checklist/items/:cid         bearer
DELETE /api/v1/trips/:id/checklist/reset              bearer
POST   /api/v1/trips/:id/checklist/share              bearer
```

### Notes
```
GET    /api/v1/trips/:id/notes           bearer
POST   /api/v1/trips/:id/notes           bearer
PATCH  /api/v1/trips/:id/notes/:nid      bearer
DELETE /api/v1/trips/:id/notes/:nid      bearer
```

### Discovery
```
GET    /api/v1/cities                    bearer
GET    /api/v1/cities/:id                bearer
GET    /api/v1/activities                bearer
GET    /api/v1/activities/:id            bearer
```

### Community
```
GET    /api/v1/community                 public
POST   /api/v1/community/:tripId/copy    bearer
```

### Users / Wishlist
```
GET    /api/v1/users/:id                 bearer
PATCH  /api/v1/users/:id                 bearer
GET    /api/v1/users/:id/saved           bearer
POST   /api/v1/users/:id/saved           bearer
DELETE /api/v1/users/:id/saved/:cid      bearer
```

### Admin
```
GET    /api/v1/admin/stats               admin
GET    /api/v1/admin/users               admin
PATCH  /api/v1/admin/users/:id           admin
DELETE /api/v1/admin/users/:id           admin
GET    /api/v1/admin/trips               admin
GET    /api/v1/admin/analytics           admin
```

---

## 7. ENDPOINT DETAILS (request/response shapes)

### POST /api/v1/auth/send-otp
```python
# Request
class SendOtpRequest(BaseModel):
    email: EmailStr
    purpose: Literal["register", "reset"] = "register"

# Response 200
{ "data": { "message": "OTP sent to email" }, "meta": { "requestId": "..." } }

# Errors
400 OTP_ALREADY_SENT      — OTP exists and not expired (rate limit)
404 USER_NOT_FOUND         — for purpose="reset" if email doesn't exist
429 TOO_MANY_ATTEMPTS      — >5 OTP requests in window
```

### POST /api/v1/auth/verify-otp
```python
class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str       # 6-digit string
    purpose: Literal["register", "reset"] = "register"

# Response 200
{ "data": { "verified": True, "resetToken": "uuid-if-reset" }, "meta": {...} }

# Errors
400 INVALID_OTP
400 OTP_EXPIRED
429 MAX_OTP_ATTEMPTS   — after 5 wrong guesses, lock for 10min
```

### POST /api/v1/auth/register
```python
# Request: multipart/form-data
class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str          # min 8 chars, validated
    phone: str | None
    city: str | None
    country: str | None
    bio: str | None
    # + avatar: UploadFile (optional)

# Response 201
{
  "data": {
    "accessToken": "eyJ...",
    "user": { ...UserResponse }
  },
  "meta": { "requestId": "..." }
}
# Also sets: Set-Cookie: refreshToken=<uuid>; HttpOnly; SameSite=Lax; Path=/api/v1/auth/refresh; Max-Age=604800

# Errors
409 EMAIL_ALREADY_EXISTS
400 OTP_NOT_VERIFIED       — must verify OTP before register
422 VALIDATION_ERROR
```

### POST /api/v1/auth/login
```python
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Response 200 + Set-Cookie: refreshToken
{ "data": { "accessToken": "eyJ...", "user": { ...UserResponse } }, "meta": {...} }

# Errors
401 INVALID_CREDENTIALS
403 ACCOUNT_BANNED
429 TOO_MANY_LOGIN_ATTEMPTS   — 10 failed attempts → 15min lockout
```

### POST /api/v1/auth/refresh
```python
# No request body — reads refreshToken from HttpOnly cookie

# Response 200
{ "data": { "accessToken": "eyJ...", "user": { ...UserResponse } }, "meta": {...} }

# Errors
401 REFRESH_TOKEN_INVALID
401 REFRESH_TOKEN_EXPIRED
```

### POST /api/v1/auth/reset-password
```python
class ResetPasswordRequest(BaseModel):
    resetToken: str    # opaque UUID from verify-otp
    newPassword: str   # min 8 chars

# Response 200
{ "data": { "message": "Password updated successfully" }, "meta": {...} }

# Errors
400 RESET_TOKEN_INVALID
400 RESET_TOKEN_EXPIRED
```

### GET /api/v1/trips (list)
```python
# Query params: status, page, limit, sort, order, search

# Response 200
{
  "data": [ ...TripResponse[] ],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3, "requestId": "..." }
}
```

### POST /api/v1/trips
```python
class TripCreate(BaseModel):
    name: str
    cityId: UUID
    startDate: date
    endDate: date
    description: str | None
    # + coverPhoto: UploadFile (optional, multipart)

# Response 201
{ "data": TripResponse, "meta": {...} }
```

### PATCH /api/v1/trips/:id/sections/reorder
```python
class ReorderRequest(BaseModel):
    orderedIds: list[UUID]  # all section IDs in new order

# Response 200
{ "data": { "message": "Sections reordered" }, "meta": {...} }
```

### GET /api/v1/trips/:id/invoice
```python
# Response 200
{
  "data": {
    "invoiceId": "INV-xyz-30290",
    "tripName": "Trip to Europe Adventure",
    "dateRange": "May 25 – Jun 05, 2025",
    "createdBy": "James",
    "travelers": ["James", "Arjun", "Jerry", "Cristina"],
    "generatedDate": "2025-05-20",
    "status": "pending",
    "totalBudget": 20000,
    "totalSpent": 22000,
    "remaining": -2000,
    "items": [
      { "id": "...", "category": "hotel", "description": "hotel booking paris",
        "qty": 3, "unitCost": 3000, "amount": 9000 },
      { "id": "...", "category": "travel", "description": "flight bookings (DEL → PAR)",
        "qty": 1, "unitCost": 12000, "amount": 12000 }
    ],
    "subtotal": 21000,
    "tax": 1050,
    "discount": 50,
    "grandTotal": 22000
  },
  "meta": { "requestId": "..." }
}
```

### GET /api/v1/admin/analytics
```python
# Response 200
{
  "data": {
    "topCities": [ { "cityId", "name", "tripCount" } ],
    "topActivities": [ { "activityId", "name", "addCount" } ],
    "userTrends": [ { "date": "2025-05-01", "newUsers": 12 } ],   // last 30 days
    "tripTrends": [ { "date": "2025-05-01", "tripsCreated": 7 } ] // last 30 days
  },
  "meta": { "requestId": "..." }
}
```

---

## 8. DEPENDENCIES (app/dependencies.py)

```python
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.services.token_service import decode_access_token
from app.models.user import User

async def get_db() -> AsyncSession:
    async with get_session() as session:
        yield session

async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)      # raises 401 if invalid/expired
    user = await db.get(User, payload["sub"])
    if not user or user.is_banned:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED)
    return user

async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user
```

---

## 9. RATE LIMITING

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Applied per endpoint:
@router.post("/auth/send-otp")
@limiter.limit("3/minute")
async def send_otp(...): ...

@router.post("/auth/login")
@limiter.limit("10/minute")
async def login(...): ...

@router.post("/auth/register")
@limiter.limit("5/minute")
async def register(...): ...

# Global default: 100/minute per IP
```

---

## 10. ERROR CODES

| Code | HTTP | Meaning |
|---|---|---|
| VALIDATION_ERROR | 422 | Pydantic validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Valid token, insufficient role |
| NOT_FOUND | 404 | Resource doesn't exist |
| EMAIL_ALREADY_EXISTS | 409 | Duplicate email on register |
| OTP_NOT_VERIFIED | 400 | Register before OTP verify |
| INVALID_OTP | 400 | Wrong OTP code |
| OTP_EXPIRED | 400 | OTP TTL passed |
| MAX_OTP_ATTEMPTS | 429 | 5 wrong guesses, locked |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| ACCOUNT_BANNED | 403 | Admin-banned account |
| TOO_MANY_LOGIN_ATTEMPTS | 429 | 10 failed logins → 15min lock |
| REFRESH_TOKEN_INVALID | 401 | Bad refresh token |
| REFRESH_TOKEN_EXPIRED | 401 | Expired refresh token |
| RESET_TOKEN_INVALID | 400 | Bad reset token |
| RESET_TOKEN_EXPIRED | 400 | Reset token TTL passed |
| OWNERSHIP_REQUIRED | 403 | User doesn't own this resource |
| FILE_TOO_LARGE | 400 | Upload exceeds MAX_UPLOAD_SIZE_MB |
| INVALID_FILE_TYPE | 400 | Non-image file uploaded |

**Standard error envelope (all errors):**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "requestId": "req_abc123",
    "timestamp": "2025-05-10T12:00:00Z"
  }
}
```

---

## 11. OWNERSHIP CHECKS

All trip-scoped endpoints must verify `trip.user_id == current_user.id`.
All section-scoped endpoints must verify `section.trip_id == trip_id` AND trip ownership.
Admin endpoints bypass ownership checks but require `role == "admin"`.

```python
async def verify_trip_owner(trip_id: UUID, user: User, db: AsyncSession) -> Trip:
    trip = await db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(404, detail={"code": "NOT_FOUND"})
    if trip.user_id != user.id:
        raise HTTPException(403, detail={"code": "OWNERSHIP_REQUIRED"})
    return trip
```

---

## 12. FILE UPLOAD HANDLING

```python
# utils/upload.py
import uuid, shutil
from pathlib import Path
from fastapi import UploadFile, HTTPException

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024   # 5MB

async def save_upload(file: UploadFile, folder: str) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, {"code": "INVALID_FILE_TYPE"})
    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(400, {"code": "FILE_TOO_LARGE"})
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    dest = Path(f"./uploads/{folder}/{filename}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(contents)
    return f"/uploads/{folder}/{filename}"
```

---

## 13. PAGINATION HELPER

```python
# utils/pagination.py
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

async def paginate(query, db: AsyncSession, page: int, limit: int):
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()
    items = (await db.execute(query.offset((page - 1) * limit).limit(limit))).scalars().all()
    return items, total, -(-total // limit)   # items, total, totalPages (ceiling div)
```

---

## 14. SECURITY CHECKLIST (OWASP API Top 10)

| Risk | Mitigation |
|---|---|
| Broken Object Level Auth | verify_trip_owner() on every trip/section endpoint |
| Broken Auth | RS256 JWT, HttpOnly refresh cookie, 15-min access token |
| Excessive Data Exposure | Pydantic response schemas strip internal fields |
| Lack of Rate Limiting | slowapi on auth endpoints; 429 with Retry-After header |
| Broken Function Level Auth | require_admin() dependency on all /admin routes |
| Mass Assignment | Explicit Pydantic schema per endpoint, no `**request.dict()` |
| Security Misconfiguration | CORS allowlist, TrustedHostMiddleware, no debug in prod |
| Injection | SQLAlchemy ORM parameterized queries; no raw SQL |
| Improper Assets Management | /docs and /redoc disabled in production |
| Brute Force | OTP attempt counter in Redis; login lockout after 10 fails |

---

## 15. DECISION LOG

| ID | Decision | Rationale |
|---|---|---|
| D001 | RS256 JWT | Asymmetric; public key sharable for verification without exposing secret |
| D002 | Redis for OTP | Fast TTL, atomic ops, no DB writes for ephemeral data |
| D003 | OTP stored as bcrypt hash in Redis | Even if Redis is compromised, raw OTP not exposed |
| D004 | Refresh token as opaque UUID in Redis | Can be instantly revoked (delete key); JWT can't be revoked without blocklist |
| D005 | Alembic migrations | Version-controlled schema, safe rollbacks |
| D006 | SQLAlchemy async | Non-blocking DB queries; FastAPI async fully utilized |
| D007 | slowapi for rate limiting | Redis-backed, FastAPI-native, minimal config |
| D008 | Soft delete not used | Hackathon scope; hard delete with cascade is simpler; add soft delete post-launch |
| D009 | Multipart for file + JSON | Avatar/cover photo uploads need FormData; keep fields flat |
| D010 | /docs disabled in prod | Prevent API surface exposure in production environment |