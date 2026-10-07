from fastapi import APIRouter, Depends, HTTPException, status

from app.comments.schemas import CommentCreate, CommentRead
from app.comments.service import CommentService
from app.common.dependencies import SessionDep
from app.users.auth import current_active_user
from app.users.models import User


router = APIRouter()


@router.post("/{ticket_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(
    ticket_id: int,
    comment_data: CommentCreate,
    session: SessionDep,
    user: User = Depends(current_active_user),
):

    comment = await CommentService.create_comment(
        session=session,
        ticket_id=ticket_id,
        user=user,
        comment_data=comment_data,
    )

    if comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found or you do not have access to this ticket",
        )

    return comment


@router.get("/{ticket_id}/comments", response_model=list[CommentRead])
async def get_ticket_comments(
    ticket_id: int,
    session: SessionDep,
    user: User = Depends(current_active_user),
):

    comments = await CommentService.get_ticket_comments(
        session=session,
        ticket_id=ticket_id,
        user=user,
    )

    if comments is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found or you do not have access to this ticket",
        )

    return comments


