from typing import Any

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.webhooks.models import Webhook
from app.webhooks.repository import WebhookRepository
from app.webhooks.schemas import WebhookCreate


class WebhookService:

    @staticmethod
    async def create_webhook(session: AsyncSession, webhook_data: WebhookCreate) -> Webhook:
        webhook = Webhook(url=str(webhook_data.url), event=webhook_data.event.value)

        return await WebhookRepository.create(
            session=session,
            webhook=webhook,
        )

    @staticmethod
    async def get_webhooks(session: AsyncSession) -> list[Webhook]:
        return await WebhookRepository.get_all(
            session=session,
        )

    @staticmethod
    async def send_webhook(session: AsyncSession, event: str, payload: dict[str, Any]) -> None:
        webhooks = await WebhookRepository.get_active_webhooks(
            session=session,
            event=event,
        )
        async with httpx.AsyncClient(timeout=10.0) as client:
            for webhook in webhooks:
                try:
                    response = await client.post(
                        webhook.url,
                        json=payload,
                    )

                    print(
                        f"Webhook sent: "
                        f"{webhook.url} "
                        f"status={response.status_code}"
                    )

                except httpx.HTTPError as error:

                    print(
                        f"Webhook failed: "
                        f"{webhook.url} "
                        f"error={error}"
                    )
