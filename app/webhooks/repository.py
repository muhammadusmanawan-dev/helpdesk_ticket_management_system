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
    async def get_by_url_and_event(session:AsyncSession, url:str, event:str)-> Webhook | None:
        result= await session.execute(
            select(Webhook).where(Webhook.url==url, Webhook.event==event)
        )
        return result.scalar_one_or_none()

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

    @staticmethod
    async def get_by_id(session: AsyncSession, webhook_id: int) -> Webhook | None:
        result = await session.execute(
            select(Webhook).where(
                Webhook.id == webhook_id
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def delete(session: AsyncSession, webhook: Webhook) -> None:
        await session.delete(webhook)
        await session.commit()
