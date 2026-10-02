from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket
from sqlalchemy import select
from app.tickets.schemas import TicketUpdate

class TicketRepository:

    @staticmethod
    async def create_ticket(session: AsyncSession,ticket: Ticket) -> Ticket:

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

    @staticmethod
    async def get_customer_ticket(
        session: AsyncSession,
        ticket_id: int,
        customer_id: UUID,
    ) -> Ticket | None:

        result = await session.execute(
            select(Ticket).where(
                Ticket.id == ticket_id,
                Ticket.customer_id == customer_id,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def update_customer_ticket(session: AsyncSession,ticket: Ticket,ticket_data: TicketUpdate,) -> Ticket:
        update_data = ticket_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(ticket, field, value)

        await session.commit()
        await session.refresh(ticket)

        return ticket
    
    @staticmethod
    async def delete_customer_ticket(session: AsyncSession,ticket: Ticket,) -> None:
        await session.delete(ticket)
        await session.commit()
