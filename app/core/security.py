from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)

from app.core.config import settings

bearer_transport = BearerTransport(
    tokenUrl="users/auth/login",
)

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.SECRET,
        lifetime_seconds=3600,
    )


auth_backend = AuthenticationBackend(
    name="auth",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)
