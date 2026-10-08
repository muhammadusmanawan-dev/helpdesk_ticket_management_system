from fastapi import APIRouter, Depends

from app.common.dependencies import SessionDep
from app.common.permissions import require_role
from app.users.models import User
from app.webhooks.schemas import WebhookCreate, WebhookRead
from app.webhooks.service import WebhookService


router = APIRouter()


@router.post("/", response_model=WebhookRead, status_code=201)
async def create_webhook(webhook_data: WebhookCreate, session: SessionDep, user: User = Depends(require_role("admin"))):
    return await WebhookService.create_webhook(
        session=session,
        webhook_data=webhook_data,
    )

@router.get("/", response_model=list[WebhookRead])
async def get_webhooks(session: SessionDep, user: User = Depends(require_role("admin"))):
    return await WebhookService.get_webhooks(
        session=session,
    )
