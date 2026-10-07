from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.notifications.schemas import NotificationRead
from app.notifications.service import NotificationService
from app.users.models import User
from app.users.auth import current_active_user


router = APIRouter()


@router.get("/", response_model=list[NotificationRead])
async def get_notifications(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_active_user),
):
    return await NotificationService.get_user_notifications(
        session=session,
        user_id=user.id,
    )


@router.patch("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_as_read(
    notification_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_active_user),
):
    return await NotificationService.mark_as_read(
        session=session,
        notification_id=notification_id,
        user_id=user.id,
    )
