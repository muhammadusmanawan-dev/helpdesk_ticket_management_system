from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket
from app.tickets.repository import TicketRepository
from app.tickets.schemas import TicketCreate, TicketUpdate, TicketUpdateStatus
from app.audit_logs.service import AuditLogService

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

    @staticmethod
    async def get_assigned_tickets(session: AsyncSession, agent_id: UUID,) -> list[Ticket]:
        return await TicketRepository.get_assigned_tickets(
            session=session,
            agent_id=agent_id,
        )
    
    @staticmethod
    async def update_ticket_status(session: AsyncSession, ticket_id: int, agent_id: UUID, ticket_data: TicketUpdateStatus ) -> Ticket | None:

        ticket = await TicketRepository.get_assigned_ticket(
            session=session,
            ticket_id=ticket_id,
            agent_id=agent_id,
        )

        if ticket is None:
            return None

        old_status = ticket.status

        await TicketRepository.update_ticket_status(
            session=session,
            ticket=ticket,
            status=ticket_data.status,
        )

        await AuditLogService.create_log(
            session=session,
            ticket_id=ticket.id,
            user_id=agent_id,
            action="status_changed",
            details=f"Status changed from {old_status} to {ticket_data.status}",
        )

        return ticket

    @staticmethod
    async def assign_ticket(
        session: AsyncSession,
        ticket_id: int,
        agent_id: UUID,
        assigned_by: UUID,
    ) -> Ticket | None:

        ticket = await TicketRepository.get_ticket(
            session=session,
            ticket_id=ticket_id,
        )

        if ticket is None:
            return None

        await TicketRepository.assign_ticket(
            session=session,
            ticket=ticket,
            agent_id=agent_id,
        )

        await AuditLogService.create_log(
            session=session,
            ticket_id=ticket.id,
            user_id=assigned_by,
            action="ticket_assigned",
            details=f"Ticket assigned to agent {agent_id}",
        )

        return ticket
