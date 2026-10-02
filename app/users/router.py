from fastapi import APIRouter, Depends

from app.users.auth import current_active_user, fastapi_users
from app.users.models import User
from app.users.schemas import UserCreate, UserRead
from app.core.security import auth_backend

router = APIRouter()

router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["Auth"],
)

router.include_router(
    fastapi_users.get_register_router(
        UserRead,
        UserCreate,
    ),
    prefix="/auth",
    tags=["Auth"],
)

@router.get("/me", response_model=UserRead)
async def get_current_user(
    user: User = Depends(current_active_user),
):
    return user
