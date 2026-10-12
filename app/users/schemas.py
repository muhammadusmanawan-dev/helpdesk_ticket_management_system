from uuid import UUID
from fastapi_users import schemas
from app.users.models import UserRole

class UserRead(schemas.BaseUser[UUID]):
    role: UserRole

class UserCreate(schemas.BaseUserCreate):
    pass
