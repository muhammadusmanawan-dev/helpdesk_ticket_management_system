from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.tickets.models import Ticket, TicketStatus
from app.tickets.repository import TicketRepository
from app.tickets.schemas import TicketCreate, TicketUpdate, TicketUpdateStatus
from app.audit_logs.service import AuditLogService
from app.tickets.filters import TicketFilter
from sqlalchemy import select
from app.notifications.service import NotificationService

from datetime import datetime, timedelta
from app.users.models import User, UserRole
from app.tickets.state_machine import validate_transition, validate_assignment
from fastapi import HTTPException, status

class TicketService:

    @staticmethod
    async def create_ticket(session: AsyncSession,ticket_data: TicketCreate,customer_id: UUID) -> Ticket:
        ticket = Ticket(
            title=ticket_data.title,
            description=ticket_data.description,
            priority=ticket_data.priority,
            customer_id=customer_id,
        )

        ticket = await TicketRepository.create_ticket(
            session=session,
            ticket=ticket,
        )
    
        await session.commit()
        return ticket
    
    @staticmethod
    async def get_customer_tickets(session: AsyncSession,customer_id: UUID, ticket_filter:TicketFilter):
        query = select(Ticket)
        query = ticket_filter.filter(query)
        query = ticket_filter.sort(query)

        return await TicketRepository.get_customer_tickets(
            session=session,
            customer_id=customer_id,
            query=query
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
    async def delete_customer_ticket(
        session: AsyncSession,
        ticket_id: int,
        customer_id: UUID,
    ) -> bool:
        ticket = await TicketRepository.get_customer_ticket(
            session=session,
            ticket_id=ticket_id,
            customer_id=customer_id,
        )

        if ticket is None:
            return False

        await TicketRepository.delete_customer_ticket(
            session=session,
            ticket=ticket,
        )

        return True

    @staticmethod
    async def get_assigned_tickets(session: AsyncSession, agent_id: UUID,) -> list[Ticket]:
        return await TicketRepository.get_assigned_tickets(
            session=session,
            agent_id=agent_id,
        )
    
 
    @staticmethod
    async def update_ticket_status(
        session: AsyncSession,
        ticket_id: int,
        ticket_data: TicketUpdateStatus,
        user: User,
    ) -> Ticket | None:
        
        if user.role == UserRole.AGENT:
            ticket = await TicketRepository.get_assigned_ticket(
                session=session,
                ticket_id=ticket_id,
                agent_id=user.id,
            )
        elif user.role == UserRole.ADMIN:
            ticket = await TicketRepository.get_ticket(
                session=session,
                ticket_id=ticket_id,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to change ticket status.",
            )

        if ticket is None:
            return None

        old_status = ticket.status

        validate_transition(
            current_status=old_status,
            new_status=ticket_data.status,
            user_role=user.role,
        )

        await TicketRepository.update_ticket_status(
            session=session,
            ticket=ticket,
            status=ticket_data.status,
        )

        await NotificationService.create_notification(
            session=session,
            user_id=ticket.customer_id,
            message=(
                f"Your ticket #{ticket.id} status changed "
                f"from {old_status} to {ticket_data.status}."
            ),
        )

        await AuditLogService.create_log(
            session=session,
            ticket_id=ticket.id,
            user_id=user.id,
            action="status_changed",
            details=(
                f"Status changed from {old_status} "
                f"to {ticket_data.status}"
            ),
        )

        await session.commit()
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

        validate_assignment(ticket.status)
        
        agent = await TicketRepository.get_agent_by_id(
        session=session,
        agent_id=agent_id,
        )

        if agent is None:
            return None

        await TicketRepository.assign_ticket(
            session=session,
            ticket=ticket,
            agent_id=agent_id,
        )

        await NotificationService.create_notification(
        session=session,
        user_id=agent_id,
        message=f"Ticket #{ticket.id} has been assigned to you.",
    )

        await AuditLogService.create_log(
            session=session,
            ticket_id=ticket.id,
            user_id=assigned_by,
            action="ticket_assigned",
            details=f"Ticket assigned to agent {agent_id}",
        )

        await session.commit()
        return ticket

    @staticmethod
    async def get_admin_tickets(session: AsyncSession):
        return await TicketRepository.get_all_tickets(session)
    
    @staticmethod
    def _build_ticket_summary(counts: dict) -> dict:
        return {
            "total_tickets": sum(counts.values()),
            "open_tickets": counts.get("open", 0),
            "assigned_tickets": counts.get("assigned", 0),
            "in_progress_tickets": counts.get("in_progress", 0),
            "resolved_tickets": counts.get("resolved", 0),
            "closed_tickets": counts.get("closed", 0),
        }
    
    @staticmethod
    async def get_dashboard_summary(
        session: AsyncSession,
    ):
        counts = await TicketRepository.get_ticket_counts(session)
        agents = await TicketRepository.get_all_agents(session)

        summary = TicketService._build_ticket_summary(counts)
        summary["total_agents"] = len(agents)

        return summary

    @staticmethod
    async def get_agent_performance(session: AsyncSession):
        agents = await TicketRepository.get_all_agents(session)
        tickets = await TicketRepository.get_all_tickets_for_analytics(session)

        performance = []

        for agent in agents:
            agent_tickets = [
                ticket for ticket in tickets
                if ticket.assigned_agent_id == agent.id
            ]

            resolved = [
                ticket for ticket in agent_tickets
                if ticket.resolved_at is not None
            ]

            durations = [
                (ticket.resolved_at - ticket.created_at).total_seconds() / 3600
                for ticket in resolved
                if ticket.created_at and ticket.resolved_at
            ]

            performance.append({
                "agent_id": agent.id,
                "email": agent.email,
                "assigned_tickets": len(agent_tickets),
                "open_tickets": sum(
                    ticket.status == TicketStatus.OPEN
                    for ticket in agent_tickets
                ),
                "resolved_tickets": sum(
                    ticket.status == TicketStatus.RESOLVED
                    for ticket in agent_tickets
                ),
                "closed_tickets": sum(
                    ticket.status == TicketStatus.CLOSED
                    for ticket in agent_tickets
                ),
                "average_resolution_hours": (
                    round(sum(durations) / len(durations), 2)
                    if durations else None
                ),
            })

        return performance

    @staticmethod
    async def get_ticket_trends(session: AsyncSession):
        tickets = await TicketRepository.get_all_tickets_for_analytics(session)

        today = datetime.now().date()
        first_day = today - timedelta(days=6)

        trends = []

        for day_offset in range(7):
            day = first_day + timedelta(days=day_offset)

            created_count = sum(
                ticket.created_at is not None
                and ticket.created_at.date() == day
                for ticket in tickets
            )

            resolved_count = sum(
                ticket.resolved_at is not None
                and ticket.resolved_at.date() == day
                for ticket in tickets
            )

            trends.append({
                "date": day.isoformat(),
                "created": created_count,
                "resolved": resolved_count,
            })

        return trends
    
    @staticmethod
    async def delete_admin_ticket(session: AsyncSession, ticket_id: int) -> bool:
        ticket = await TicketRepository.get_ticket(
            session=session,
            ticket_id=ticket_id,
        )

        if ticket is None:
            return False

        await TicketRepository.delete_ticket(
            session=session,
            ticket=ticket,
        )
        return True

    @staticmethod
    async def get_assigned_tickets_query(
        session: AsyncSession,
        agent_id: UUID,
        ticket_filter: TicketFilter,
    ):
        query = select(Ticket)
        query = ticket_filter.filter(query)
        query = ticket_filter.sort(query)

        return await TicketRepository.get_assigned_tickets_query(
            session=session,
            agent_id=agent_id,
            query=query,
        )

    @staticmethod
    async def get_admin_tickets_query(
        session: AsyncSession,
        ticket_filter: TicketFilter,
    ):
        query = select(Ticket)
        query = ticket_filter.filter(query)
        query = ticket_filter.sort(query)

        return await TicketRepository.get_admin_tickets_query(
            session=session,
            query=query,
        )

    @staticmethod
    async def get_customer_dashboard_summary(
        session: AsyncSession,
        customer_id: UUID,
    ) -> dict:
        counts = await TicketRepository.get_ticket_counts(
            session=session,
            customer_id=customer_id,
        )

        return TicketService._build_ticket_summary(counts)

    @staticmethod
    async def get_agent_dashboard_summary(
        session: AsyncSession,
        agent_id: UUID,
    ) -> dict:
        counts = await TicketRepository.get_ticket_counts(
            session=session,
            agent_id=agent_id,
        )

        return TicketService._build_ticket_summary(counts)
    

    @staticmethod
    async def get_agent_priority_summary(
        session: AsyncSession,
        agent_id: UUID,
    ) -> dict:
        return await TicketRepository.get_agent_priority_counts(
            session=session,
            agent_id=agent_id,
        )

