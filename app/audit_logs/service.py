from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.audit_logs.models import AuditLog
from app.audit_logs.repository import AuditLogRepository
from app.tickets.repository import TicketRepository
from app.users.models import User


class AuditLogService:

    @staticmethod
    async def create_log(
        session: AsyncSession,
        ticket_id: int,
        user_id: UUID,
        action: str,
        details: str,
    ) -> AuditLog:

        audit_log = AuditLog(
            ticket_id=ticket_id,
            user_id=user_id,
            action=action,
            details=details,
        )

        return await AuditLogRepository.create_audit_log(
            session=session,
            audit_log=audit_log,
        )

    @staticmethod
    async def get_ticket_history(
        session: AsyncSession,
        ticket_id: int,
        user: User,
    ) -> list[AuditLog] | None:

        if user.role == "customer":
            ticket = await TicketRepository.get_customer_ticket(
                session=session,
                ticket_id=ticket_id,
                customer_id=user.id,
            )

        elif user.role == "agent":
            ticket = await TicketRepository.get_assigned_ticket(
                session=session,
                ticket_id=ticket_id,
                agent_id=user.id,
            )

        elif user.role == "admin":
            ticket = await TicketRepository.get_ticket(
                session=session,
                ticket_id=ticket_id,
            )

        else:
            return None

        if ticket is None:
            return None

        return await AuditLogRepository.get_ticket_history(
            session=session,
            ticket_id=ticket_id,
        )
