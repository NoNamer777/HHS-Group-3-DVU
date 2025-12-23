from fastapi_plugin import Auth0FastAPI
from typing import Callable

from project.config import get_settings

settings = get_settings()

if settings.is_auth_configured():
    auth0 = Auth0FastAPI(domain=settings.auth0_domain, audience=settings.auth0_api_audience)
else:
    # No-op auth for local development when Auth0 env vars are not provided.
    # `require_auth()` returns a dependency that simply returns an empty dict.
    class _NoOpAuth:
        def require_auth(self) -> Callable[..., dict]:
            async def _noop() -> dict:
                return {}

            return _noop

    auth0 = _NoOpAuth()
