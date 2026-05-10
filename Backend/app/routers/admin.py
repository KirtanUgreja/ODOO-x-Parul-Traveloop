"""Admin router for system management and analytics."""

import datetime as dt
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.admin import (
    UserAdminResponse,
    UserAdminUpdate,
    TripAdminResponse,
)
from app.services import admin_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


def _make_error_response(request: Request, code: str, message: str, status_code: int) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "requestId": getattr(request.state, "request_id", None),
            "timestamp": dt.datetime.utcnow().isoformat() + "Z",
        }
    }


@router.get("/stats", response_model=None, status_code=status.HTTP_200_OK)
async def get_stats(
    request: Request,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get overall system statistics."""
    stats = await admin_service.get_stats(db)
    return _make_success_response(stats, request)


@router.get("/users", response_model=None, status_code=status.HTTP_200_OK)
async def list_users(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    users, total, total_pages = await admin_service.list_users(db, page, limit)
    return _make_success_response({
        "data": [UserAdminResponse.model_validate(u).model_dump() for u in users],
        "total": total,
        "page": page,
        "total_pages": total_pages,
    }, request)


@router.patch("/users/{user_id}", response_model=None, status_code=status.HTTP_200_OK)
async def update_user(
    request: Request,
    user_id: str,
    body: UserAdminUpdate,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a user (admin only)."""
    user = await admin_service.update_user(
        db,
        user_id=user_id,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        city=body.city,
        country=body.country,
        bio=body.bio,
        role=body.role,
        is_banned=body.is_banned,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": "User not found"},
        )
    return _make_success_response(
        UserAdminResponse.model_validate(user).model_dump(),
        request,
    )


@router.delete("/users/{user_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_user(
    request: Request,
    user_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user (admin only)."""
    success = await admin_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "USER_NOT_FOUND", "message": "User not found"},
        )
    return _make_success_response(
        {"message": "User deleted successfully"},
        request,
    )


@router.get("/trips", response_model=None, status_code=status.HTTP_200_OK)
async def list_trips(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all trips (admin only)."""
    trips, total, total_pages = await admin_service.list_trips(db, page, limit)
    return _make_success_response({
        "data": [TripAdminResponse.model_validate(t).model_dump() for t in trips],
        "total": total,
        "page": page,
        "total_pages": total_pages,
    }, request)


@router.get("/analytics", response_model=None, status_code=status.HTTP_200_OK)
async def get_analytics(
    request: Request,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics data (admin only)."""
    analytics = await admin_service.get_analytics(db)
    return _make_success_response(analytics, request)
