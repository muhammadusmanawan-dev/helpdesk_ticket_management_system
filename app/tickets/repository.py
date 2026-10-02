from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket
from sqlalchemy import select

class TicketRepository:

    @staticmethod
    async def create_ticket(session: AsyncSession,ticket: Ticket,) -> Ticket:

        session.add(ticket)

        await session.commit()
        await session.refresh(ticket)

        return ticket
    
    @staticmethod
    async def get_customer_tickets(session: AsyncSession,customer_id: UUID,) -> list[Ticket]:
        result = await session.execute(
            select(Ticket).where(
                Ticket.customer_id == customer_id
            )
        )

        return list(result.scalars().all())
