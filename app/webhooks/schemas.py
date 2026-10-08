from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, HttpUrl
from app.webhooks.events import WebhookEvent

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
