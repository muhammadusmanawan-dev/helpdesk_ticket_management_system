from fastapi import APIRouter, Depends

from app.users.auth import current_active_user, fastapi_users
from app.users.models import User, UserRole
from app.users.schemas import UserCreate, UserRead
from app.core.security import auth_backend
from app.common.permissions import require_role

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

@router.get("/admin-test")
async def admin_test(user: User = Depends(require_role(UserRole.ADMIN)),):
    return {
        "message": "You are an admin",
        "email": user.email,
    }
