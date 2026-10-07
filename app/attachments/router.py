from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.attachments.schemas import AttachmentRead
from app.attachments.service import AttachmentService
from app.common.dependencies import SessionDep
from app.users.auth import current_active_user
from app.users.models import User


router = APIRouter()


@router.post("/{ticket_id}/attachments", response_model=AttachmentRead, status_code=status.HTTP_201_CREATED)
async def create_attachment(ticket_id: int, file: UploadFile = File(...), session: SessionDep = None, user: User = Depends(current_active_user)):

    attachment = await AttachmentService.create_attachment(
        session=session,
        ticket_id=ticket_id,
        user=user,
        file=file,
    )

    if attachment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found or you do not have access to this ticket",
        )

    return attachment


@router.get("/{ticket_id}/attachments", response_model=list[AttachmentRead])
async def get_ticket_attachments(ticket_id: int, session: SessionDep, user: User = Depends(current_active_user)):

    attachments = await AttachmentService.get_ticket_attachments(
        session=session,
        ticket_id=ticket_id,
        user=user,
    )

    if attachments is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found or you do not have access to this ticket",
        )

    return attachments
