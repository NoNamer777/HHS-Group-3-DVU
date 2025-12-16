# models/mail.py
from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class MailBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    userId: str = Field(..., min_length=1)
    from_: EmailStr = Field(..., alias="from")  # "from" is a Python keyword
    to: EmailStr
    subject: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)


class MailOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    id: str
    userId: str
    from_: EmailStr = Field(..., alias="from")
    to: EmailStr
    subject: str
    body: str
    isRead: bool
    createdAt: datetime
    updatedAt: datetime


class GetMailsByUserResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    items: List[MailOut]


class GetMailByIdResponse(MailOut):
    pass


class MailCreate(MailBase):
    pass


class CreateMailResponse(MailOut):
    pass


class MarkMailReadResponse(MailOut):
    pass


class MailCountResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    unreadCount: int = Field(..., ge=0)
    totalCount: int = Field(..., ge=0)
