from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.notifications.models import Notification
from app.notifications.repository import NotificationRepository

class NotificationService:
    @staticmethod
    async def create_notification(session: AsyncSession, user_id: UUID, message: str) -> Notification:
        return await NotificationRepository.create(
            session=session,
            user_id=user_id,
            message=message,
        )

    @staticmethod
    async def get_user_notifications(session: AsyncSession,user_id: UUID, search: str|None):
        return await NotificationRepository.get_user_notifications(
            session=session,
            user_id=user_id,
            search=search
        )

    @staticmethod
    async def mark_as_read(session: AsyncSession, notification_id: int, user_id: UUID) -> Notification:
        notification = await NotificationRepository.get_by_id(
            session=session,
            notification_id=notification_id,
        )

        if notification is None or notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )

        return await NotificationRepository.mark_as_read(
            session=session,
            notification=notification,
        )
