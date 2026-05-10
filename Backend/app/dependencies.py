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
