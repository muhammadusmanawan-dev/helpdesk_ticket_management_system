from fastapi_users import FastAPIUsers

from app.core.security import auth_backend
from uuid import UUID
from app.users.models import User
from app.users.service import get_user_manager


fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)
