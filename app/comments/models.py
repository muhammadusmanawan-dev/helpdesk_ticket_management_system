from datetime import datetime
from uuid import UUID
from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True,index=True)
    content: Mapped[str] = mapped_column(String(1000),nullable=False)
    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"),nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"),nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime,server_default=func.now(),nullable=False)
