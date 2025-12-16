from typing import Annotated

from fastapi import APIRouter, Depends, status

from project.db.models.mail import (
    CreateMailResponse,
    GetMailByIdResponse,
    GetMailsByUserResponse,
    MailCountResponse,
    MailCreate,
    MarkMailReadResponse,
)
from project.services.auth_service import get_bearer_token
from project.services.mail_service import (
    create_mail,
    delete_mail_by_id,
    get_mail_by_id,
    get_mail_by_user,
    get_mail_count,
    mark_mail_as_read,
)

router = APIRouter(
    prefix="/mails",
    responses={404: {"description": "Mail or user not found"}},
    tags=["Mails"],
)


@router.get(
    "/user/{user_id}",
    response_model=GetMailsByUserResponse,
    status_code=status.HTTP_200_OK,
)
async def get_mails_by_user(
    user_id: int, token: str = Depends(get_bearer_token)
) -> GetMailsByUserResponse:
    mails = await get_mail_by_user(token=token, user_id=user_id)
    return mails


@router.get(
    "/{mail_id}", response_model=GetMailByIdResponse, status_code=status.HTTP_200_OK
)
async def get_mail(
    mail_id: int, token: str = Depends(get_bearer_token)
) -> GetMailByIdResponse:
    mail = await get_mail_by_id(token=token, mail_id=mail_id)
    return mail


@router.post(
    "/", response_model=CreateMailResponse, status_code=status.HTTP_201_CREATED
)
async def create_new_mail(
    form_data: Annotated[MailCreate, Depends()], token: str = Depends(get_bearer_token)
) -> CreateMailResponse:
    mail = await create_mail(form_data=form_data, token=token)
    return mail


@router.patch(
    "/{mail_id}/read",
    response_model=MarkMailReadResponse,
    status_code=status.HTTP_200_OK,
)
async def mark_read(
    mail_id: int, token: str = Depends(get_bearer_token)
) -> MarkMailReadResponse:
    marked_mail = await mark_mail_as_read(mail_id=mail_id, token=token)
    return marked_mail


@router.delete("/{mail_id}", response_model=None, status_code=status.HTTP_200_OK)
async def delete_mail(mail_id: int, token: str = Depends(get_bearer_token)) -> None:
    await delete_mail_by_id(mail_id=mail_id, token=token)


@router.get(
    "/user/{user_id}/count",
    response_model=MailCountResponse,
    status_code=status.HTTP_200_OK,
)
async def get_count(
    user_id: int, token: str = Depends(get_bearer_token)
) -> MailCountResponse:
    count = await get_mail_count(user_id=user_id, token=token)
    return count
