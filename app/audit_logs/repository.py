from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit_logs.models import AuditLog

class AuditLogRepository:

    @staticmethod
    async def create_audit_log(session: AsyncSession, audit_log: AuditLog) -> AuditLog:
        session.add(audit_log)
        await session.commit()
        await session.refresh(audit_log)
        return audit_log
    
    @staticmethod
    async def get_ticket_history(session: AsyncSession, ticket_id: int) -> list[AuditLog]:
        result = await session.execute(
            select(AuditLog).where(
                AuditLog.ticket_id == ticket_id
            ).order_by(AuditLog.created_at)
        )
        return list(result.scalars().all())
