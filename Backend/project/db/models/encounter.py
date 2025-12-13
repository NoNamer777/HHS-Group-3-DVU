from pydantic import BaseModel

from project.db.models.basemodel import DVUBaseModel, PaginationResponse
from project.db.models.enums import (
    EncounterStatusEnum,
    EncounterTypeEnum,
)
from project.db.models.patient_base import PatientRead
from project.db.models.user import UserRead


class EncounterRead(DVUBaseModel):
    type: EncounterTypeEnum
    status: EncounterStatusEnum
    start: str
    end: str
    reason: str
    patientId: int


class EncounterResponse(EncounterRead):
    location: str
    createdById: int


class EncounterListResponse(EncounterRead):
    patient: PatientRead
    createdBy: UserRead


class PaginatedEncounterResponse(BaseModel):
    encounters: list[EncounterListResponse]
    pagination: PaginationResponse
