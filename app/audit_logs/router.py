from fastapi import APIRouter, Depends

from app.audit_logs.schemas import AuditLogRead
from app.audit_logs.service import AuditLogService
from app.common.dependencies import SessionDep
from app.users.auth import current_active_user
from app.users.models import User
from fastapi import HTTPException, status

router = APIRouter()


@router.get("/{ticket_id}/history", response_model=list[AuditLogRead])
async def get_ticket_history(ticket_id: int, session: SessionDep, user: User = Depends(current_active_user)):
    history=await AuditLogService.get_ticket_history(
        session=session,
        ticket_id=ticket_id,
        user=user,
    )
    if history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found or you do not have access to this ticket",
        )
    return history
