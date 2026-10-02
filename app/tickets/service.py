from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket
from app.tickets.repository import TicketRepository
from app.tickets.schemas import TicketCreate, TicketUpdate
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
    

    @staticmethod
    async def update_customer_ticket(session: AsyncSession, ticket_id: int, customer_id: UUID, ticket_data: TicketUpdate) -> Ticket | None:

        ticket = await TicketRepository.get_customer_ticket(
            session=session,
            ticket_id=ticket_id,
            customer_id=customer_id,
        )

        if ticket is None:
            return None

        return await TicketRepository.update_customer_ticket(
            session=session,
            ticket=ticket,
            ticket_data=ticket_data,
        )
    
    @staticmethod
    async def delete_customer_ticket(session:AsyncSession, ticket_id:int, customer_id:UUID):
        ticket = await TicketRepository.get_customer_ticket(
            session=session,
            ticket_id=ticket_id,
            customer_id=customer_id
        )
        return True
