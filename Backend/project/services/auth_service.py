from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from db.models.user import UserCreate, UserResponse
from project.globals import EPD_URL

route_prefix = f"{EPD_URL}/api/auth"


async def create_token_service(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> UserResponse:
    """
    Create token for the user using form data
    """

    epd_url = f"{route_prefix}/login"
    payload = {"email": form_data.username, "password": form_data.password}

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
            detail="Gebruikersnaam of wachtwoord is incorrect",
        ) from exc

    data = response.json()
    return UserResponse.model_validate(data)


async def register_user_service(
    form_data: Annotated[UserCreate, Depends()],
) -> UserResponse:
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
            detail="Email al in gebruik",
        ) from exc

    data = response.json()
    return UserResponse.model_validate(data)


async def profile_information_service() -> UserResponse:
    """
    Gives logged in user information
    """

    epd_url = f"{route_prefix}/profile"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(epd_url)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc

    data = response.json()
    return UserResponse.model_validate(data)
