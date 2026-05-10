# Traveloop Backend Design (Full Spec Implementation)

Date: 2026-05-10
Branch: kirtan

## Goal

Implement Traveloop backend inside `Backend/` matching `Docs/Backend.md`:

- FastAPI + async SQLAlchemy + Alembic + Postgres + Redis
- JWT RS256 access tokens (15m)
- Refresh token = opaque UUID stored in Redis and set as HttpOnly cookie (7d)
- OTP system stored in Redis (10m TTL) with brute-force attempt lockout
- Full API surface under `/api/v1` as listed in `Docs/Backend.md`

Out of scope: Odoo integration.

## Folder Layout (Backend/)

All backend code lives under `Backend/`.

```
Backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── redis_client.py
│   ├── dependencies.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── services/
│   └── utils/
├── alembic/
├── tests/
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── alembic.ini
```

### Core Files (kept isolated)

- `app/main.py`: FastAPI init, middleware, router include, exception handlers, OpenAPI toggles.
- `app/config.py`: settings via `pydantic-settings` + `.env`.
- `app/database.py`: async SQLAlchemy engine/session only. Never touch Redis here.
- `app/redis_client.py`: Redis client only. Never touch DB here.
- `app/dependencies.py`: dependency wiring (`get_db`, `get_current_user`, `require_admin`). No business logic.

### Utilities Layer (explicit)

- `app/utils/security.py`
  - `hash_password()`, `verify_password()` (bcrypt via passlib)
  - `encode_access_token_rs256(payload)` / `decode_access_token_rs256(token)`
  - Only access token is JWT; refresh token never JWT.
- `app/utils/upload.py`
  - validate image type, enforce max size, save into `UPLOAD_DIR`
- `app/utils/pagination.py`
  - `paginate(query, db, page, limit)` helper

## Runtime Configuration

Use `.env` shape from `Docs/Backend.md` (kept out of git by `.gitignore`). Keys (`Backend/keys/*.pem`) are gitignored.

## API Contract

Base prefix: `/api/v1`.

Response envelope for success:

```json
{ "data": { }, "meta": { "requestId": "..." } }
```

Error envelope for all errors:

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

Routers stay thin:

- Parse request + schema validation
- auth dependency injection
- call service
- return envelope

All business logic lives in services.

## Auth Design (Exact Decisions)

### Access Token (JWT RS256)

- Lifetime: 15 minutes
- Payload: `sub`, `role`, `iss`, `aud`, `exp`, `iat`, `jti`
- Encode/decode lives in `app/utils/security.py`

### Refresh Token (opaque UUID)

- Refresh token is **not JWT**
- Stored in Redis:
  - Key: `refresh:{token_uuid}`
  - Value: `user_id`
  - TTL: 7 days
- Sent to client as HttpOnly cookie.

### OTP (Redis)

- 6-digit numeric string
- Stored as bcrypt hash (never store raw OTP)
- Redis keys:
  - `otp:{purpose}:{email}` -> bcrypt hash, TTL 10 minutes
  - `otp_attempts:{purpose}:{email}` -> integer count, TTL 10 minutes
- Brute-force lockout:
  - Max 5 wrong attempts
  - When attempts reach 5, treat as locked until TTL expires (`MAX_OTP_ATTEMPTS`).

### Reset Token (after OTP verify for reset)

- Redis: `reset_token:{uuid}` -> `user_id`, TTL 15 minutes

### Rate Limiting

- slowapi per endpoints (from `Docs/Backend.md`):
  - `send-otp`: `3/minute`
  - `login`: `10/minute`
  - `register`: `5/minute`
- Global default: `100/minute` per IP

## Data Model (Explicit Tables)

SQLAlchemy 2.0 async ORM models.

### Core

- `User`
  - id (UUID)
  - email (unique)
  - password_hash
  - role (`user|admin`)
  - is_banned
  - profile fields (firstName/lastName/phone/city/country/bio/avatar_url)
- `City`
  - id (UUID)
  - name, country, image_url (as needed)
- `ActivityCatalog` (Discovery)
  - id (UUID)
  - name, city_id (nullable), tags

### Trips

- `Trip`
  - id (UUID)
  - user_id (FK User)
  - city_id (FK City)
  - name, start_date, end_date, description, cover_photo_url
  - status fields (per contract if present)
- `Section`
  - id (UUID)
  - trip_id (FK Trip)
  - title
  - sort_order
- `SectionActivity`
  - id (UUID)
  - section_id (FK Section)
  - title/time/location/notes
  - sort_order

### Budget / Invoice

- `BudgetItem`
  - id (UUID)
  - trip_id (FK Trip)
  - category, description, qty, unit_cost, amount
- `Invoice`
  - id (UUID)
  - trip_id (FK Trip, 1:1)
  - invoice_number (`INV-...`)
  - status (`pending|paid|overdue`)
  - generated_at
  - Totals computed from budget items at read time (no JSON snapshots).

### Checklist / Notes

- `ChecklistItem`
  - id (UUID)
  - trip_id (FK Trip)
  - text, is_done
  - sort_order
- `Note`
  - id (UUID)
  - trip_id (FK Trip)
  - content

### Sharing / Community / Saved

- `SharedTrip`
  - id (UUID)
  - trip_id (FK Trip)
  - token (unique)
  - created_by_user_id
  - created_at
  - expires_at (nullable)
  - revoked_at (nullable)
- `SavedCity`
  - id (UUID)
  - user_id (FK User)
  - city_id (FK City)
  - created_at
- `CommunityTrip`
  - id (UUID)
  - source_trip_id (FK Trip)
  - created_by_user_id
  - title/summary
  - published_at
  - moderation_status (`visible|hidden|removed`)
  - is_featured

## Service Layer Responsibilities

Services contain:

- ownership checks (`verify_trip_owner` single source)
- reorder logic (`PATCH /sections/reorder`)
- invoice generation/formatting (`GET /invoice`, `PATCH /invoice/status`)
- OTP create/verify + lockout
- refresh token issuance/rotation/revocation
- admin analytics aggregation
- community copy logic (`POST /community/:tripId/copy`)

Routers must not exceed simple orchestration.

## Security Checklist (OWASP mapping)

- Broken Object Level Auth: enforce owner checks for all trip-scoped resources.
- Broken Function Level Auth: `require_admin` for `/admin/*`.
- Mass Assignment: explicit request schemas + manual mapping.
- Rate Limiting: slowapi rules above.
- Excessive Data Exposure: response schemas strip internal fields (`password_hash`, etc.).
- Misconfiguration: CORS allowlist, disable `/docs` and `/redoc` in prod.

## Testing Strategy

- `pytest` + `pytest-asyncio` + `httpx`
- Cover:
  - auth: otp send/verify, register/login/refresh/logout, lockout behavior
  - trips: CRUD + ownership enforcement
  - admin: forbidden without admin, allowed with admin

## Deployment / Local Dev

- `Backend/docker-compose.yml` runs Postgres + Redis + API.
- `Backend/Dockerfile` builds API container.
