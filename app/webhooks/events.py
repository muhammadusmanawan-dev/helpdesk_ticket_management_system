from enum import Enum
from app.tickets.models import Ticket

class WebhookEvent(str, Enum):
    TICKET_CREATED = "ticket_created"
    TICKET_ASSIGNED = "ticket_assigned"
    TICKET_STATUS_CHANGED = "ticket_status_changed"


def build_ticket_created_payload(ticket: Ticket) -> dict:
    return {
        "event": WebhookEvent.TICKET_CREATED,
        "ticket_id": ticket.id,
        "title": ticket.title,
        "priority": ticket.priority,
        "customer_id": str(ticket.customer_id),
    }

def build_ticket_assigned_payload(ticket: Ticket) -> dict:
    return {
        "event": WebhookEvent.TICKET_ASSIGNED,
        "ticket_id": ticket.id,
        "agent_id": str(ticket.assigned_agent_id),
    }

def build_ticket_status_changed_payload(ticket: Ticket) -> dict:
    return {
        "event": WebhookEvent.TICKET_STATUS_CHANGED,
        "ticket_id": ticket.id,
        "status": ticket.status,
    }

EVENT_PAYLOAD_BUILDERS = {
    WebhookEvent.TICKET_CREATED: build_ticket_created_payload,
    WebhookEvent.TICKET_ASSIGNED: build_ticket_assigned_payload,
    WebhookEvent.TICKET_STATUS_CHANGED: build_ticket_status_changed_payload,
}
