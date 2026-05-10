from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.trips import router as trips_router
from app.routers.sections import router as sections_router
from app.routers.activities import router as activities_router
from app.routers.budget import router as budget_router


api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(trips_router, prefix="/trips", tags=["trips"])
api_router.include_router(sections_router, prefix="/trips", tags=["sections"])
api_router.include_router(activities_router, prefix="/trips", tags=["activities"])
api_router.include_router(budget_router, prefix="/trips", tags=["budget"])
