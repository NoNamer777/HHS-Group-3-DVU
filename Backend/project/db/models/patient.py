from pydantic import BaseModel

from project.db.models.basemodel import PaginationResponse
from project.db.models.details import PatientDetailResponse


class PaginatedPatientResponse(BaseModel):
    patients: list[PatientDetailResponse]
    pagination: PaginationResponse
