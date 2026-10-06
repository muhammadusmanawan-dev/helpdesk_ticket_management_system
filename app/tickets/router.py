from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.common.permissions import require_role
from app.common.dependencies import SessionDep
from app.tickets.schemas import TicketCreate, TicketRead, TicketUpdate, TicketUpdateStatus
from app.tickets.service import TicketService
from app.users.models import User
from fastapi import HTTPException
from uuid import UUID
from fastapi_filter import FilterDepends
from app.tickets.filters import TicketFilter
from fastapi_pagination import Page, Params
from fastapi_pagination.ext.sqlalchemy import apaginate

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

@router.get("/", response_model=Page[TicketRead])
async def get_customer_tickets(
    session: SessionDep,
    ticket_filter: TicketFilter = FilterDepends(TicketFilter),
    params: Params = Depends(),
    user: User = Depends(require_role("customer")),
):
    query = await TicketService.get_customer_tickets(
        session=session,
        customer_id=user.id,
        ticket_filter=ticket_filter,
    )

    return await apaginate(
        session,
        query,
        params,
    )

@router.get("/assigned", response_model=list[TicketRead])
async def get_my_assigned_tickets(
    session: SessionDep,
    user: User = Depends(require_role("agent")),
):
    print("USER ID:", user.id)
    print("USER ID TYPE:", type(user.id))

    return await TicketService.get_assigned_tickets(
        session=session,
        agent_id=user.id,
    )

@router.get("/assigned/{agent_id}", response_model=list[TicketRead])
async def get_assigned_tickets_by_id(
    agent_id: int,
    session: SessionDep,
    user: User = Depends(require_role("agent")),
):
    return await TicketService.get_assigned_tickets(
        session=session,
        agent_id=agent_id,
    )

@router.patch("/{ticket_id}/status",response_model=TicketRead)
async def update_ticket_status(
    ticket_id: int,
    ticket_data: TicketUpdateStatus,
    session: SessionDep,
    user: User = Depends(require_role("agent")),
):
    ticket = await TicketService.update_ticket_status(
        session=session,
        ticket_id=ticket_id,
        agent_id=user.id,
        ticket_data=ticket_data,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found or not assigned to you",
        )

    return ticket

@router.patch(
    "/{ticket_id}/assign/{agent_id}",
    response_model=TicketRead,
)
async def assign_ticket(
    ticket_id: int,
    agent_id: UUID,
    session: SessionDep,
    user: User = Depends(require_role("admin")),
):
    
    ticket = await TicketService.assign_ticket(
    session=session,
    ticket_id=ticket_id,
    agent_id=agent_id,
    assigned_by=user.id,
)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    return ticket

@router.get("/{ticket_id}",response_model=TicketRead,)
async def get_customer_ticket(
    ticket_id: int,
    session: SessionDep,
    user: User = Depends(require_role("customer")),
):
    ticket = await TicketService.get_customer_ticket(
        session=session,
        ticket_id=ticket_id,
        customer_id=user.id,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    return ticket

@router.patch("/{ticket_id}",response_model=TicketRead)
async def update_customer_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    session: SessionDep,
    user: User = Depends(require_role("customer"))):

    ticket = await TicketService.update_customer_ticket(
        session=session,
        ticket_id=ticket_id,
        customer_id=user.id,
        ticket_data=ticket_data,
    )

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    return ticket

@router.delete("/{ticket_id}", response_model=TicketRead)
async def delete_customer_ticket(ticket_id:int, session:SessionDep, user: User=Depends(require_role("customer"))):
    deleted=await TicketService.delete_customer_ticket(
        session=session,
        ticket_id=ticket_id,
        customer_id=user.id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Ticket not found"
        )
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

