from fastapi import APIRouter, Depends, status

from app.common.permissions import require_role
from app.common.dependencies import SessionDep
from app.tickets.schemas import TicketCreate, TicketRead
from app.tickets.service import TicketService
from app.users.models import User

router = APIRouter()

@router.post("/",response_model=TicketRead,status_code=status.HTTP_201_CREATED,)
async def create_ticket(
    ticket_data: TicketCreate,
    session: SessionDep,
    user: User = Depends(require_role("customer")),
):
    return await TicketService.create_ticket(
        session=session,
        ticket_data=ticket_data,
        customer_id=user.id,
    )

@router.get("/",response_model=list[TicketRead],)
async def get_customer_tickets(
    session: SessionDep,
    user: User = Depends(require_role("customer")),
):
    return await TicketService.get_customer_tickets(
        session=session,
        customer_id=user.id,
    )
