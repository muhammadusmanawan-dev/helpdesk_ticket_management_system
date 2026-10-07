from app.core.database import Base
from app.users.models import User
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, DateTime, func
from datetime import datetime
from uuid import UUID
from enum import Enum

class TicketPriority(str, Enum):
    LOW="low"
    MEDIUM="medium"
    HIGH="high"
    URGENT="urgent"

class TicketStatus(str, Enum):
    OPEN="open"
    ASSIGNED="assigned"
    IN_PROGRESS="in_progress"
    RESOLVED="resolved"
    CLOSED="closed"

class Ticket(Base):
    __tablename__="tickets"

    id: Mapped[int]=mapped_column(primary_key=True, index=True)
    title: Mapped[str]=mapped_column(nullable=False)
    description: Mapped[str]=mapped_column(nullable=False)
    priority: Mapped[TicketPriority]=mapped_column(String(20), nullable=False, default=TicketPriority.LOW)
    status: Mapped[TicketStatus]=mapped_column(String(20), nullable=False, default=TicketStatus.OPEN)

    customer_id: Mapped[UUID]=mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_agent_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"),nullable=True)

    customer:Mapped[User]=relationship(foreign_keys=[customer_id])
    assigned_agent: Mapped[User | None] = relationship(foreign_keys=[assigned_agent_id])
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
