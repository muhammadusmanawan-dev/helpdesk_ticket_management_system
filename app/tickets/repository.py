from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket


class TicketRepository:

    @staticmethod
    async def create_ticket(session: AsyncSession,ticket: Ticket,) -> Ticket:
        
        session.add(ticket)

        await session.commit()
        await session.refresh(ticket)

        return ticket
