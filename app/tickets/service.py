from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket
from app.tickets.repository import TicketRepository
from app.tickets.schemas import TicketCreate
from sqlalchemy import select

class TicketService:

    @staticmethod
    async def create_ticket(session: AsyncSession,ticket_data: TicketCreate,customer_id: UUID) -> Ticket:
        ticket = Ticket(
            title=ticket_data.title,
            description=ticket_data.description,
            priority=ticket_data.priority,
            customer_id=customer_id,
        )

        return await TicketRepository.create_ticket(
            session=session,
            ticket=ticket,
        )
    
    @staticmethod
    async def get_customer_tickets(session: AsyncSession,customer_id: UUID,) -> list[Ticket]:
        return await TicketRepository.get_customer_tickets(
            session=session,
            customer_id=customer_id,
        )

    @staticmethod
    async def get_customer_ticket(session: AsyncSession,ticket_id: int,customer_id: UUID,) -> Ticket | None:
        return await TicketRepository.get_customer_ticket(
            session=session,
            ticket_id=ticket_id,
            customer_id=customer_id,
        )
