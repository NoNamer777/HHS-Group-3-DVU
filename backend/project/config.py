from functools import lru_cache
from typing import Optional
import logging

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    auth0_domain: Optional[str] = None
    auth0_api_audience: Optional[str] = None
    auth0_disabled: bool = False

    def is_auth_configured(self) -> bool:
        return bool((self.auth0_domain and self.auth0_api_audience) and not self.auth0_disabled)


@lru_cache
def get_settings() -> Settings:
    settings = Settings()  # type: ignore
    if not settings.is_auth_configured():
        logger.warning("Auth0 not configured: AUTH0_DOMAIN and AUTH0_API_AUDIENCE are missing. App will run in no-auth dev mode.")
    return settings
