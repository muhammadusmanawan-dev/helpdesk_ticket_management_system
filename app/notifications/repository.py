from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.notifications.models import Notification

class NotificationRepository:

    @staticmethod
    async def create(session: AsyncSession, user_id: UUID, message: str) -> Notification:
        notification = Notification(
            user_id=user_id,
            message=message,
        )

        session.add(notification)
        await session.commit()
        await session.refresh(notification)

        return notification

    @staticmethod
    async def get_user_notifications(session: AsyncSession, user_id: UUID) -> list[Notification]:
        result = await session.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
        )

        return list(result.scalars().all())

    @staticmethod
    async def mark_as_read(session: AsyncSession, notification: Notification) -> Notification:
        notification.is_read = True

        await session.commit()
        await session.refresh(notification)

        return notification

    @staticmethod
    async def get_by_id(session: AsyncSession, notification_id: int) -> Notification | None:
        result = await session.execute(
            select(Notification).where(
                Notification.id == notification_id
            )
        )

        return result.scalar_one_or_none()
