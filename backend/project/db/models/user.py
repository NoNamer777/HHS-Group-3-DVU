from typing import Optional

from pydantic import BaseModel

from project.db.models.basemodel import DVUBaseModel
from project.db.models.enums import UserRoleEnum


class UserRead(DVUBaseModel):
    firstName: str
    lastName: str


class User(DVUBaseModel):
    firstName: str
    lastName: str
    email: str
    role: Optional[UserRoleEnum] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    scope: Optional[str] = None
