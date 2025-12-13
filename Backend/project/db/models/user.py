from typing import Optional

from pydantic import BaseModel

from project.db.models.basemodel import DVUBaseModel
from project.db.models.enums import UserRoleEnum


class Auth(BaseModel):
    email: str
    password: str


class UserRead(DVUBaseModel):
    firstName: str
    lastName: str


class User(DVUBaseModel):
    firstName: str
    lastName: str
    email: str
    role: Optional[UserRoleEnum] = None


class TokenResponse(BaseModel):
    message: str
    accessToken: str
    refreshToken: str
    expiresIn: str
    user: User


class UserCreate(User):
    password: str
