from datetime import datetime

from pydantic import BaseModel

from project.db.models.enums import GenderEnum, PatientStatusEnum
from project.db.models.user import User


class PatientResponse(User):
    hospitalNumber: str
    dateOfBirth: datetime
    gender: GenderEnum
    phone: str
    address: str
    city: str
    zipCode: str
    status: PatientStatusEnum


class PaginatedPatientResponse(BaseModel):
    patients: list[PatientResponse]
    total: int
    page: int
    limit: int
