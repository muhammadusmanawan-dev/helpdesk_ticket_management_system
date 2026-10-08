from sqlalchemy.ext.asyncio import AsyncSession

from app.comments.models import Comment
from app.comments.repository import CommentRepository
from app.comments.schemas import CommentCreate
from app.tickets.models import Ticket
from app.tickets.repository import TicketRepository
from app.users.models import User
from app.notifications.service import NotificationService
from app.users.models import UserRole

class CommentService:

    @staticmethod
    async def create_comment(
        session: AsyncSession,
        ticket_id: int,
        user: User,
        comment_data: CommentCreate,
    ) -> Comment | None:

        ticket = await CommentService._get_accessible_ticket(
            session=session,
            ticket_id=ticket_id,
            user=user,
        )

        if ticket is None:
            return None

        comment = Comment(
            content=comment_data.content,
            ticket_id=ticket_id,
            user_id=user.id,
        )

        comment = await CommentRepository.create_comment(
        session=session,
        comment=comment,
    )

        if user.role == UserRole.CUSTOMER and ticket.assigned_agent_id:
            await NotificationService.create_notification(
                session=session,
                user_id=ticket.assigned_agent_id,
                message=f"New comment added to ticket #{ticket.id}.",
            )

        elif user.role == UserRole.AGENT:
            await NotificationService.create_notification(
                session=session,
                user_id=ticket.customer_id,
                message=f"New comment added to ticket #{ticket.id}.",
            )

        return comment

    @staticmethod
    async def get_ticket_comments(
        session: AsyncSession,
        ticket_id: int,
        user: User,
    ) -> list[Comment] | None:

        ticket = await CommentService._get_accessible_ticket(
            session=session,
            ticket_id=ticket_id,
            user=user,
        )

        if ticket is None:
            return None

        return await CommentRepository.get_ticket_comments(
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
            UserRole.CUSTOMER: TicketRepository.get_customer_ticket,
            UserRole.AGENT: TicketRepository.get_assigned_ticket,
        }

        repository_method = repository_by_role.get(user.role)

        if repository_method is None:
            return None

        kwargs = {
            "session": session,
            "ticket_id": ticket_id,
        }

        if user.role == UserRole.CUSTOMER:
            kwargs["customer_id"] = user.id

        elif user.role == UserRole.AGENT:
            kwargs["agent_id"] = user.id

        return await repository_method(**kwargs)
