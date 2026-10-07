from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.attachments.models import Attachment


class AttachmentRepository:

    @staticmethod
    async def create_attachment(session: AsyncSession,attachment: Attachment) -> Attachment:

        session.add(attachment)

        await session.commit()
        await session.refresh(attachment)

        return attachment

    @staticmethod
    async def get_ticket_attachments(session: AsyncSession,ticket_id: int) -> list[Attachment]:

        result = await session.execute(
            select(Attachment).where(
                Attachment.ticket_id == ticket_id
            ).order_by(Attachment.created_at)
        )

        return list(result.scalars().all())
