from typing import Optional

from project.db.models.basemodel import DVUBaseModel
from project.db.models.enums import GenderEnum, PatientStatusEnum
from project.db.models.user import User


class PatientRead(DVUBaseModel):
    hospitalNumber: str
    firstName: str
    lastName: str


class PatientResponse(User):
    hospitalNumber: str
    dateOfBirth: str
    sex: GenderEnum
    phone: str
    addressLine1: str
    addressLine2: Optional[str] = None
    city: str
    postalCode: str
    status: PatientStatusEnum
    updatedAt: str
    createdById: int
