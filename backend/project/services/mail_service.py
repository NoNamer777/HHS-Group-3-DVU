from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, status

from project.db.models.mail import (
    CreateMailResponse,
    GetMailByIdResponse,
    GetMailsByUserResponse,
    MailCountResponse,
    MailCreate,
    MarkMailReadResponse,
)
from project.globals import MAIL_URL
from project.services.auth_service import create_header

route_prefix = f"{MAIL_URL}/api/mails"


async def get_mail_by_user(token: str, user_id: int) -> GetMailsByUserResponse:
    """
    Get all mails by user
    """
    route_url = f"{route_prefix}/user/"
    params = {"userId": user_id}

    params = {k: v for k, v in params.items() if v is not None}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                route_url, params=params, headers=create_header(token)
            )
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Mail service niet bereikbaar",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return GetMailsByUserResponse.model_validate(data)


async def get_mail_by_id(token: str, mail_id: int) -> GetMailByIdResponse:
    """
    Get a mail based on id.
    Only mails of the logged in user can be gained
    """
    route_url = route_prefix
    params = {"id": mail_id}
    params = {k: v for k, v in params.items() if v is not None}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                route_url, params=params, headers=create_header(token)
            )
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Mail service niet bereikbaar",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return GetMailByIdResponse.model_validate(data)


async def create_mail(
    token: str, form_data: Annotated[MailCreate, Depends()]
) -> CreateMailResponse:
    """
    Create a new mail for the logged in user:
    """
    route_url = route_prefix
    payload = form_data.model_dump(by_alias=True)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                route_url, json=payload, headers=create_header(token)
            )
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Mail service niet bereikbaar",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return CreateMailResponse.model_validate(data)


async def mark_mail_as_read(token: str, mail_id: int) -> MarkMailReadResponse:
    """
    Mark a mail of the logged in user as read
    """

    route_url = f"{route_prefix}/{mail_id}/read"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(route_url, headers=create_header(token))
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Mail service niet bereikbaar",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return MarkMailReadResponse.model_validate(data)


async def delete_mail_by_id(token: str, mail_id: int) -> None:
    """
    Delete a mail of the logged in user
    """

    route_url = route_prefix
    params = {"id": mail_id}
    params = {k: v for k, v in params.items() if v is not None}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(route_url, headers=create_header(token))
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Mail service niet bereikbaar",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc


async def get_mail_count(token: str, user_id: int) -> MailCountResponse:
    """
    Get amount of mails a user has in their inbox
    """

    route_url = f"{route_prefix}/user/{user_id}/count"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(route_url, headers=create_header(token))
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Mail service niet bereikbaar",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return MailCountResponse.model_validate(data)
