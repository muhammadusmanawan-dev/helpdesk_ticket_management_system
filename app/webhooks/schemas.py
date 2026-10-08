from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, HttpUrl

class WebhookEvent(str, Enum):
    TICKET_CREATED = "ticket_created"
    TICKET_ASSIGNED = "ticket_assigned"
    TICKET_STATUS_CHANGED = "ticket_status_changed"

class WebhookCreate(BaseModel):
    url: HttpUrl
    event: WebhookEvent

class WebhookRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    url: str
    event: str
    is_active: bool
    created_at: datetime
