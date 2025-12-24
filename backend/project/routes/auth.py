from fastapi import APIRouter, status

from project.db.models.user import TokenResponse
from project.services.auth_service import (
    create_token_service,
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
