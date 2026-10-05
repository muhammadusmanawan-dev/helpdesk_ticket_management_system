from sqlalchemy.ext.asyncio import AsyncSession

from app.comments.models import Comment
from app.comments.repository import CommentRepository
from app.comments.schemas import CommentCreate
from app.tickets.repository import TicketRepository
from app.users.models import User


class CommentService:

    @staticmethod
    async def create_comment(session: AsyncSession, ticket_id: int, user: User, comment_data: CommentCreate) -> Comment | None:
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

        comment = Comment(content=comment_data.content, ticket_id=ticket_id, user_id=user.id)

        return await CommentRepository.create_comment(session=session, comment=comment)

    @staticmethod
    async def get_ticket_comments(session: AsyncSession, ticket_id: int, user: User) -> list[Comment] | None:
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

        return await CommentRepository.get_ticket_comments(session=session,ticket_id=ticket_id)
