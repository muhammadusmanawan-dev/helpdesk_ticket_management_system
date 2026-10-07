from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.tickets.models import TicketPriority, TicketStatus
class TicketCreate(BaseModel):
    title: str
    description: str
    priority: TicketPriority = TicketPriority.LOW

class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    priority: TicketPriority
    status: TicketStatus
    customer_id: UUID
    assigned_agent_id: UUID | None
    created_at: datetime
    updated_at: datetime

class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: TicketPriority | None = None

class TicketUpdateStatus(BaseModel):
    status:TicketStatus
