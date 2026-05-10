"""Users router for user-related endpoints like saved cities."""

import datetime as dt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import SavedCityListResponse, SavedCityResponse
from app.services import saved_service

router = APIRouter()


def _make_success_response(data, request: Request) -> dict:
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", None),
        },
    }


@router.get("/{user_id}/saved", response_model=None, status_code=status.HTTP_200_OK)
async def list_saved_cities(
    request: Request,
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List saved cities for a user."""
    # Users can only see their own saved cities
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "Can only view own saved cities"}
        )

    saved_cities = await saved_service.list_saved_cities(db, current_user.id)

    # Build response with city details
    result = []
    for sc in saved_cities:
        city_data = {
            "id": str(sc.id),
            "user_id": str(sc.user_id),
            "city_id": str(sc.city_id),
            "city_name": sc.city.name if sc.city else None,
            "city_country": sc.city.country if sc.city else None,
        }
        result.append(result)

    return _make_success_response(result, request)


@router.post("/{user_id}/saved", response_model=None, status_code=status.HTTP_201_CREATED)
async def save_city(
    request: Request,
    user_id: str,
    city_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save a city for a user."""
    # Users can only save to their own account
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "Can only save to own account"}
        )

    saved_city = await saved_service.save_city(db, current_user.id, city_id)

    return _make_success_response({
        "id": str(saved_city.id),
        "user_id": str(saved_city.user_id),
        "city_id": str(saved_city.city_id),
        "city_name": saved_city.city.name if saved_city.city else None,
        "city_country": saved_city.city.country if saved_city.city else None,
    }, request)


@router.delete("/{user_id}/saved/{city_id}", response_model=None, status_code=status.HTTP_200_OK)
async def unsave_city(
    request: Request,
    user_id: str,
    city_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a saved city for a user."""
    # Users can only unsave from their own account
    if str(current_user.id) != user_id:
        raise HTTPException(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "Can only unsave from own account"}
        )

    await saved_service.unsave_city(db, current_user.id, city_id)

    return _make_success_response({"message": "City removed from saved"}, request)
