import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from project.auth_setup import auth0
from project.db.models.user import TokenResponse
from project.globals import (
    AUTH0_API_AUDIENCE,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    AUTH0_DOMAIN,
)

bearer_scheme = HTTPBearer(auto_error=True)


def get_bearer_token(
    token: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    _: dict = Depends(auth0.require_auth()),
) -> str:
    if token.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return token.credentials


def create_header(token: str) -> dict:
    """
    Create header
    """
    return {"Authorization": f"Bearer {token}"}


def check_scope(required: str):
    async def dep(claims: dict = Depends(auth0.require_auth())):
        scopes = set((claims.get("scope") or "").split())
        if required not in scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
            )
        return claims

    return dep


async def create_token_service() -> TokenResponse:
    """
    Create token for the user (only for debug)
    """

    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "audience": AUTH0_API_AUDIENCE,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=payload)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Auth0 niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return TokenResponse.model_validate(data)
