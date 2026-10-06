from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.attachments.models import Attachment
from app.attachments.repository import AttachmentRepository
from app.tickets.repository import TicketRepository
from app.users.models import User


UPLOAD_DIR = Path("uploads")


class AttachmentService:

    @staticmethod
    async def create_attachment(session: AsyncSession, ticket_id: int, user: User, file: UploadFile) -> Attachment | None:

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

        else:
            return None

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
    async def get_ticket_attachments(session: AsyncSession, ticket_id: int, user: User) -> list[Attachment] | None:

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

        else:
            return None

        if ticket is None:
            return None

        return await AttachmentRepository.get_ticket_attachments(
            session=session,
            ticket_id=ticket_id,
        )
