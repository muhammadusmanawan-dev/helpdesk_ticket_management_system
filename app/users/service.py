from collections.abc import AsyncGenerator
from uuid import UUID

from fastapi import Depends
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

from app.common.dependencies import SessionDep
from app.users.models import User


async def get_user_db(
    session: SessionDep,
) -> AsyncGenerator[SQLAlchemyUserDatabase[User, UUID], None]:
    yield SQLAlchemyUserDatabase(
        session,
        User,
    )

class UserManager(UUIDIDMixin, BaseUserManager[User, UUID]):
    reset_password_token_secret = "CHANGE_THIS_LATER"
    verification_token_secret = "CHANGE_THIS_LATER"


async def get_user_manager(
    user_db: SQLAlchemyUserDatabase[User, UUID] = Depends(get_user_db),
):
    yield UserManager(user_db)
