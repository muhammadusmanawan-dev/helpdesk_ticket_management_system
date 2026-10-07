from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.comments.models import Comment


class CommentRepository:
    @staticmethod
    async def create_comment(session: AsyncSession,comment: Comment) -> Comment:

        session.add(comment)

        await session.commit()
        await session.refresh(comment)

        return comment

    @staticmethod
    async def get_ticket_comments(
        session: AsyncSession, ticket_id: int) -> list[Comment]:

        result = await session.execute(
            select(Comment)
            .where(Comment.ticket_id == ticket_id)
            .order_by(Comment.created_at)
        )

        return list(result.scalars().all())
