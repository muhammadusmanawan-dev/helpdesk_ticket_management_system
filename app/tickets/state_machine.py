from fastapi import HTTPException, status
from app.tickets.models import TicketStatus
from app.users.models import UserRole

ALLOWED_TRANSITIONS = {
    TicketStatus.OPEN: {
        TicketStatus.ASSIGNED,
    },
    TicketStatus.ASSIGNED: {
        TicketStatus.IN_PROGRESS,
        TicketStatus.OPEN,
    },
    TicketStatus.IN_PROGRESS: {
        TicketStatus.RESOLVED,
        TicketStatus.ASSIGNED,
        TicketStatus.OPEN,
    },
    TicketStatus.RESOLVED: {
        TicketStatus.CLOSED,
        TicketStatus.IN_PROGRESS,
        TicketStatus.ASSIGNED,
        TicketStatus.OPEN,
    },
    TicketStatus.CLOSED: {
        TicketStatus.OPEN,
    },
}

AGENT_TRANSITIONS = {
    TicketStatus.ASSIGNED: {
        TicketStatus.IN_PROGRESS,
    },
    TicketStatus.IN_PROGRESS: {
        TicketStatus.RESOLVED,
    },
}

def validate_transition(current_status: TicketStatus, new_status: TicketStatus, user_role: UserRole) -> None:
    allowed_statuses = ALLOWED_TRANSITIONS.get(current_status,set())

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status transition.",
        )

    if user_role == UserRole.AGENT:
        agent_allowed = AGENT_TRANSITIONS.get(
            current_status,
            set(),
        )

        if new_status not in agent_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Agents cannot perform this status change.",
            )

    elif user_role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to change ticket status.",
        )


def validate_assignment(current_status: TicketStatus) -> None:
    assignable_statuses = {
        TicketStatus.OPEN,
        TicketStatus.ASSIGNED,
        TicketStatus.IN_PROGRESS,
    }

    if current_status not in assignable_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This ticket cannot be assigned in its current status.",
        )
