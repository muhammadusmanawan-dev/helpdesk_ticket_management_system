from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket
from app.tickets.repository import TicketRepository
from app.tickets.schemas import TicketCreate


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
