from pydantic import BaseModel

from project.db.models.basemodel import DVUBaseModel
from project.db.models.enums import UserRoleEnum


class User(DVUBaseModel):
    firstName: str
    lastName: str
    email: str
    role: UserRoleEnum


class UserResponse(BaseModel):
    message: str
    token: str
    user: User


class UserCreate(User):
    password: str
