from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket,TicketStatus
from sqlalchemy import select
from app.tickets.schemas import TicketUpdate

from sqlalchemy import func
from app.users.models import User, UserRole

from datetime import datetime

class TicketRepository:

    @staticmethod
    async def create_ticket(session: AsyncSession,ticket: Ticket) -> Ticket:

        session.add(ticket)

        await session.flush()
        await session.refresh(ticket)

        return ticket
    
    @staticmethod
    async def get_customer_tickets(session: AsyncSession,customer_id: UUID, query=None) -> list[Ticket]:

        if query is None:
            query = select(Ticket)

        query = query.where(
            Ticket.customer_id == customer_id
        )

        return query

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

    @staticmethod
    async def get_assigned_tickets(session:AsyncSession, agent_id:UUID)-> list[Ticket]:
        result=await session.execute(
            select(Ticket).where(Ticket.assigned_agent_id==agent_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_assigned_ticket(session:AsyncSession, ticket_id:int, agent_id:UUID)-> Ticket| None:
        result=await session.execute(select(Ticket).where(Ticket.id==ticket_id, Ticket.assigned_agent_id==agent_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_ticket_status(session: AsyncSession, ticket: Ticket, status: TicketStatus) -> Ticket:
        if status == TicketStatus.RESOLVED:
            if ticket.status != TicketStatus.RESOLVED:
                ticket.resolved_at = datetime.now()
        else:
            ticket.resolved_at = None

        ticket.status = status

        await session.flush()
        await session.refresh(ticket)

        return ticket
    
    @staticmethod
    async def get_ticket(
        session: AsyncSession,
        ticket_id: int,
    ) -> Ticket | None:

        result = await session.execute(
            select(Ticket).where(
                Ticket.id == ticket_id
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    async def assign_ticket(session: AsyncSession, ticket: Ticket, agent_id: UUID) -> Ticket:
        ticket.assigned_agent_id = agent_id
        ticket.status = TicketStatus.ASSIGNED

        await session.flush()
        await session.refresh(ticket)

        return ticket

    @staticmethod
    async def get_all_tickets(session: AsyncSession):
        result = await session.execute(
            select(Ticket).order_by(Ticket.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_all_agents(session: AsyncSession):
        result = await session.execute(
            select(User)
            .where(User.role == UserRole.AGENT)
            .order_by(User.email)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_ticket_counts(session: AsyncSession):
        result = await session.execute(
            select(Ticket.status, func.count(Ticket.id))
            .group_by(Ticket.status)
        )

        return {
            str(status.value if hasattr(status, "value") else status): count
            for status, count in result.all()
        }

    @staticmethod
    async def get_all_tickets_for_analytics(session: AsyncSession):
        result = await session.execute(select(Ticket))
        return list(result.scalars().all())

    @staticmethod
    async def delete_ticket(
        session: AsyncSession,
        ticket: Ticket,
    ) -> None:
        await session.delete(ticket)
        await session.commit()

    @staticmethod
    async def get_agent_by_id(session: AsyncSession,agent_id: UUID) -> User | None:
        result = await session.execute(
            select(User).where(
                User.id == agent_id,
                User.role == UserRole.AGENT,
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_assigned_tickets_query(
        session: AsyncSession,
        agent_id: UUID,
        query=None,
    ):
        if query is None:
            query = select(Ticket).order_by(Ticket.created_at.desc())

        return query.where(
            Ticket.assigned_agent_id == agent_id
        )

    @staticmethod
    async def get_admin_tickets_query(
        session: AsyncSession,
        query=None,
    ):
        if query is None:
            query = select(Ticket).order_by(Ticket.created_at.desc())

        return query
