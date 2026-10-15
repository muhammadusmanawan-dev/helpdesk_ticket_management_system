from fastapi import HTTPException, status
from app.tickets.models import TicketStatus

ALLOWED_TRANSITIONS = {
    TicketStatus.OPEN: {
        TicketStatus.ASSIGNED,
    },
    TicketStatus.ASSIGNED: {
        TicketStatus.IN_PROGRESS,
    },
    TicketStatus.IN_PROGRESS: {
        TicketStatus.RESOLVED,
    },
    TicketStatus.RESOLVED: {
        TicketStatus.CLOSED,
    },
    TicketStatus.CLOSED: set(),
}

def validate_transition(current_status: TicketStatus, new_status: TicketStatus) -> None:
    allowed_statuses = ALLOWED_TRANSITIONS.get(current_status, set())

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status transition: "
                f"{current_status} -> {new_status}"
            ),
        )


def validate_assignment(current_status: TicketStatus) -> None:
    if current_status != TicketStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only open tickets can be assigned.",
        )
