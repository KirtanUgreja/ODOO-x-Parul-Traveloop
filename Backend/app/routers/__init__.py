from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.trips import router as trips_router
from app.routers.sections import router as sections_router
from app.routers.activities import router as activities_router
from app.routers.budget import router as budget_router
from app.routers.checklist import router as checklist_router
from app.routers.notes import router as notes_router
from app.routers.community import router as community_router
from app.routers.users import router as users_router
from app.routers.share import router as share_router
from app.routers.admin import router as admin_router


api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(trips_router, prefix="/trips", tags=["trips"])
api_router.include_router(sections_router, prefix="/trips", tags=["sections"])
api_router.include_router(activities_router, prefix="/trips", tags=["activities"])
api_router.include_router(budget_router, prefix="/trips", tags=["budget"])
api_router.include_router(checklist_router, prefix="/trips", tags=["checklist"])
api_router.include_router(notes_router, prefix="/trips", tags=["notes"])
api_router.include_router(share_router, prefix="/trips", tags=["share"])
api_router.include_router(community_router, prefix="/community", tags=["community"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
