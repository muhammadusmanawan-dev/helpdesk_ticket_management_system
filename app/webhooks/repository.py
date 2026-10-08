from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.webhooks.models import Webhook

class WebhookRepository:
    @staticmethod
    async def create(session: AsyncSession, webhook: Webhook) -> Webhook:
        session.add(webhook)
        await session.commit()
        await session.refresh(webhook)
        return webhook

    @staticmethod
    async def get_active_webhooks(session: AsyncSession, event: str) -> list[Webhook]:
        result = await session.execute(
            select(Webhook)
            .where(
                Webhook.event == event,
                Webhook.is_active.is_(True),
            )
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_all(session: AsyncSession) -> list[Webhook]:
        result = await session.execute(
            select(Webhook).order_by(Webhook.created_at.desc())
        )
        return list(result.scalars().all())
