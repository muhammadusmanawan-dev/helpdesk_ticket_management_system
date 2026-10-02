from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from fastapi_users.db import SQLAlchemyBaseUserTableUUID

from app.core.database import Base

class UserRole(str):
    ADMIN = "admin"
    CUSTOMER = "customer"
    SUPPORT_AGENT = "support_agent"

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"

    role: Mapped[str] = mapped_column(
        String(20),
        default=UserRole.CUSTOMER,
        nullable=False,
    )
