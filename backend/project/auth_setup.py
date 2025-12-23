from fastapi_plugin import Auth0FastAPI

from project.config import get_settings

settings = get_settings()
auth0 = Auth0FastAPI(domain=settings.auth0_domain, audience=settings.auth0_api_audience)
