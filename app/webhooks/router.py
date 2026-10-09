from fastapi import APIRouter, Depends, Response, status 

from app.common.dependencies import SessionDep
from app.common.permissions import require_role
from app.users.models import User, UserRole
from app.webhooks.service import WebhookService
from app.webhooks.schemas import WebhookCreate, WebhookRead, WebhookUpdate

router = APIRouter()


@router.post("/", response_model=WebhookRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(UserRole.ADMIN))])
async def create_webhook(webhook_data: WebhookCreate, session: SessionDep):
    return await WebhookService.create_webhook(
        session=session,
        webhook_data=webhook_data,
    )

@router.get("/", response_model=list[WebhookRead], status_code=status.HTTP_200_OK, dependencies=[Depends(require_role(UserRole.ADMIN))])
async def get_webhooks(session: SessionDep):
    return await WebhookService.get_webhooks(
        session=session,
    )

@router.patch("/{webhook_id}", response_model=WebhookRead, dependencies=[Depends(require_role(UserRole.ADMIN))], status_code=status.HTTP_200_OK)
async def update_webhook(webhook_id: int, webhook_data: WebhookUpdate, session: SessionDep):
    return await WebhookService.update_webhook(
        session=session,
        webhook_id=webhook_id,
        webhook_data=webhook_data,
    )
@router.delete("/{webhook_id}",status_code=status.HTTP_204_NO_CONTENT,dependencies=[Depends(require_role(UserRole.ADMIN))])
async def delete_webhook(webhook_id: int, session: SessionDep):
    await WebhookService.delete_webhook(
        session=session,
        webhook_id=webhook_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
