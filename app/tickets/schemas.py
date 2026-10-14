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
    resolved_at: datetime | None = None

class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: TicketPriority | None = None

class TicketUpdateStatus(BaseModel):
    status:TicketStatus

class TicketDashboardSummary(BaseModel):
    total_tickets: int
    open_tickets: int
    assigned_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    closed_tickets: int
    total_agents: int

class AgentPerformance(BaseModel):
    agent_id: UUID
    email: str
    assigned_tickets: int
    open_tickets: int
    resolved_tickets: int
    closed_tickets: int
    average_resolution_hours: float | None

class DailyTicketTrend(BaseModel):
    date: str
    created: int
    resolved: int
