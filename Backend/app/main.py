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
        allow_methods=["*"],
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
