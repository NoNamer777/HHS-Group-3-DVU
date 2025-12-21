from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from project.auth_setup import auth0
from project.db.models.user import TokenResponse, User, UserCreate
from project.globals import (
    AUTH0_API_AUDIENCE,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    AUTH0_DOMAIN,
    EPD_URL,
)

route_prefix = f"{EPD_URL}/api/auth"
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


async def register_user_service(
    form_data: Annotated[UserCreate, Depends()],
) -> TokenResponse:
    """
    Register a user
    """

    epd_url = f"{route_prefix}/register"
    payload = form_data.model_dump(by_alias=True)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(epd_url, json=payload)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return TokenResponse.model_validate(data)


async def profile_information_service(token: str) -> User:
    """
    Gives logged in user information
    """

    epd_url = f"{route_prefix}/profile"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(epd_url, headers=create_header(token))
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return User.model_validate(data)
