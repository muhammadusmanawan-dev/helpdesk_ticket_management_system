from typing import Any

import httpx
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.webhooks.models import Webhook
from app.webhooks.repository import WebhookRepository
from app.webhooks.schemas import WebhookCreate, WebhookUpdate


class WebhookService:

    @staticmethod
    async def create_webhook(session: AsyncSession, webhook_data: WebhookCreate) -> Webhook:
        url = str(webhook_data.url)
        event=webhook_data.event.value
        existing_webhook=await WebhookRepository.get_by_url_and_event(session=session, url=url, event=event)
        if existing_webhook:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Webhook for this URL and event already exists"
            )

        webhook = Webhook(url=url,event=event)

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
    async def update_webhook(session: AsyncSession, webhook_id: int, webhook_data: WebhookUpdate) -> Webhook:
        webhook = await WebhookRepository.get_by_id(session=session, webhook_id=webhook_id)

        if webhook is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Webhook not found",
            )

        new_url = (
            str(webhook_data.url)
            if webhook_data.url is not None
            else webhook.url
        )

        new_event = (
            webhook_data.event.value
            if webhook_data.event is not None
            else webhook.event
        )

        existing_webhook = await WebhookRepository.get_by_url_and_event(
            session=session,
            url=new_url,
            event=new_event,
        )

        if existing_webhook and existing_webhook.id != webhook.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Webhook for this URL and event already exists",
            )

        webhook.url = new_url
        webhook.event = new_event

        if webhook_data.is_active is not None:
            webhook.is_active = webhook_data.is_active

        await session.commit()
        await session.refresh(webhook)

        return webhook
    
    @staticmethod
    async def delete_webhook(session: AsyncSession, webhook_id: int) -> None:
        webhook = await WebhookRepository.get_by_id(session=session, webhook_id=webhook_id)
        if webhook is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Webhook not found",
            )

        await WebhookRepository.delete(
            session=session,
            webhook=webhook,
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
