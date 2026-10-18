import redis.asyncio as redis
from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
    RedisStrategy,
)

from app.core.config import settings

# Redis Client connection
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
)

# HttpOnly Cookie rules
cookie_transport = CookieTransport(
    cookie_name="helpdesk_session",
    cookie_max_age=8 * 60 * 60,
    cookie_path="/",
    cookie_secure=False,
    cookie_httponly=True,
    cookie_samesite="lax",
)

# Redis manages the token-to-user mapping.
def get_redis_strategy() -> RedisStrategy:
    return RedisStrategy(
        redis_client,
        lifetime_seconds=8 * 60 * 60,
    )


auth_backend = AuthenticationBackend(
    name="auth",
    transport=cookie_transport,
    get_strategy=get_redis_strategy,
)
