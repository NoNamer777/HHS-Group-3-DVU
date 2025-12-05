from datetime import datetime

from pydantic import BaseModel

from project.db.models.basemodel import DVUBaseModel
from project.db.models.enums import EncounterStatusEnum, EncounterTypeEnum


class EncounterResponse(DVUBaseModel):
    type: EncounterTypeEnum
    status: EncounterStatusEnum
    start: datetime
    end: datetime
    reason: str
    patientId: str


class PaginatedEncounterResponse(BaseModel):
    total: int
    page: int
    limit: int
    encounters: list[EncounterResponse]
