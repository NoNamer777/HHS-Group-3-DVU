from typing import Annotated

from fastapi import APIRouter, Depends, status

from project.db.models.user import TokenResponse, User, UserCreate
from project.services.auth_service import (
    create_token_service,
    get_bearer_token,
    profile_information_service,
    register_user_service,
)

router = APIRouter(
    prefix="/auth",
    responses={404: {"description": "Not found"}},
    tags=["Authorization"],
)


@router.post("/login/", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def create_token() -> TokenResponse:
    """
    Create token for the user
    """
    token = await create_token_service()
    return token


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register_user(form_data: Annotated[UserCreate, Depends()]) -> TokenResponse:
    """
    Register a new user
    """
    user = await register_user_service(form_data)
    return user


@router.get("/profile", response_model=User, status_code=status.HTTP_200_OK)
async def profile_information(token: str = Depends(get_bearer_token)) -> User:
    """
    Request profile info from logged in user
    """
    user = await profile_information_service(token=token)
    return user
