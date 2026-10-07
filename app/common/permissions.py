from fastapi import Depends, HTTPException, status

from app.users.auth import current_active_user
from app.users.models import User, UserRole


def require_role(required_role:UserRole):
    async def role_checker(user: User=Depends(current_active_user)):
        if user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have the required role: {required_role}",
            )
        return user
    return role_checker
