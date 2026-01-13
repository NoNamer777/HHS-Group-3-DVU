from typing import Optional

from project.db.models.basemodel import DVUBaseModel
from project.db.models.enums import GenderEnum, PatientStatusEnum
from project.db.models.user import User


class PatientRead(DVUBaseModel):
    hospitalNumber: Optional[str] = None
    firstName: str
    lastName: str


class PatientResponse(User):
    hospitalNumber: Optional[str] = None
    dateOfBirth: Optional[str] = None
    sex: Optional[GenderEnum] = None
    phone: Optional[str] = None
    addressLine1: Optional[str] = None
    addressLine2: Optional[str] = None
    city: Optional[str] = None
    postalCode: Optional[str] = None
    status: Optional[PatientStatusEnum] = None
    updatedAt: Optional[str] = None
    createdById: Optional[int] = None
