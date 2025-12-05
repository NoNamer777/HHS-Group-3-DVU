from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from db.models.user import UserCreate, UserResponse
from project.services.auth_service import (
    create_token_service,
    profile_information_service,
    register_user_service,
)

router = APIRouter(
    prefix="/auth",
    responses={404: {"description": "Not found"}},
    tags=["Authorization"],
)


@router.post("/login/", status_code=status.HTTP_200_OK)
async def create_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> UserResponse:
    """
    Create token for the user
    """
    token = await create_token_service(form_data=form_data)
    return token


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(form_data: Annotated[UserCreate, Depends()]) -> UserResponse:
    """
    Register a new user
    """
    user = await register_user_service(form_data)
    return user


@router.get("/profile", status_code=status.HTTP_200_OK)
async def profile_information() -> UserResponse:
    """
    Request profile info from logged in user
    """
    user = await profile_information_service()
    return user
