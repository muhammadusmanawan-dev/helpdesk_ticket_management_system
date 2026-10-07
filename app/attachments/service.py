from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.attachments.models import Attachment
from app.attachments.repository import AttachmentRepository
from app.tickets.models import Ticket
from app.tickets.repository import TicketRepository
from app.users.models import User


UPLOAD_DIR = Path("uploads")


class AttachmentService:

    @staticmethod
    async def create_attachment(
        session: AsyncSession,
        ticket_id: int,
        user: User,
        file: UploadFile,
    ) -> Attachment | None:

        ticket = await AttachmentService._get_accessible_ticket(
            session=session,
            ticket_id=ticket_id,
            user=user,
        )

        if ticket is None:
            return None

        ticket_directory = UPLOAD_DIR / f"ticket_{ticket_id}"
        ticket_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        file_path = ticket_directory / file.filename

        with open(file_path, "wb") as saved_file:
            content = await file.read()
            saved_file.write(content)

        attachment = Attachment(
            filename=file.filename,
            file_path=str(file_path),
            ticket_id=ticket_id,
            uploaded_by=user.id,
        )

        return await AttachmentRepository.create_attachment(
            session=session,
            attachment=attachment,
        )

    @staticmethod
    async def get_ticket_attachments(
        session: AsyncSession,
        ticket_id: int,
        user: User,
    ) -> list[Attachment] | None:

        ticket = await AttachmentService._get_accessible_ticket(
            session=session,
            ticket_id=ticket_id,
            user=user,
        )

        if ticket is None:
            return None

        return await AttachmentRepository.get_ticket_attachments(
            session=session,
            ticket_id=ticket_id,
        )

    @staticmethod
    async def _get_accessible_ticket(
        session: AsyncSession,
        ticket_id: int,
        user: User,
    ) -> Ticket | None:

        repository_by_role = {
            "customer": TicketRepository.get_customer_ticket,
            "agent": TicketRepository.get_assigned_ticket,
        }

        repository_method = repository_by_role.get(user.role)

        if repository_method is None:
            return None

        kwargs = {
            "session": session,
            "ticket_id": ticket_id,
        }

        if user.role == "customer":
            kwargs["customer_id"] = user.id

        elif user.role == "agent":
            kwargs["agent_id"] = user.id

        return await repository_method(**kwargs)
