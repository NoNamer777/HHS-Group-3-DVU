from typing import List, Optional

from project.db.models.basemodel import DVUBaseModel
from project.db.models.encounter import EncounterResponse
from project.db.models.enums import (
    DiagnosisTypeEnum,
    InsuranceStatusEnum,
    MedicalRecordTypeEnum,
)
from project.db.models.patient_base import PatientResponse
from project.db.models.user import User, UserRead


class MedicalRecordsResponse(DVUBaseModel):
    type: MedicalRecordTypeEnum
    title: str
    content: str
    patientId: int
    encounterId: int
    authorId: int
    author: UserRead


class DiagnosesResponse(DVUBaseModel):
    code: str
    description: str
    type: DiagnosisTypeEnum
    onset: str
    resolved: Optional[str] = None
    patientId: int
    encounterId: int
    authorId: int
    author: UserRead


class Allergies(DVUBaseModel):
    substance: str
    reaction: Optional[str] = None
    severity: Optional[str] = None
    notedAt: Optional[str] = None
    patientId: Optional[int] = None


class Insurer(DVUBaseModel):
    name: str
    code: str
    phone: str
    email: str
    website: str
    address: Optional[str] = None


class InsurancePolicies(DVUBaseModel):
    policyNumber: str
    status: InsuranceStatusEnum
    startDate: str
    endDate: Optional[str] = None
    patientId: int
    insurerId: int
    insurer: Insurer


class PatientDetailResponse(PatientResponse):
    createdBy: Optional[User] = None
    encounters: List[EncounterResponse] = []
    diagnoses: List[DiagnosesResponse] = []
    allergies: List[Allergies] = []
    insurancePolicies: List[InsurancePolicies] = []


class EncounterDetailResponse(EncounterResponse):
    patient: PatientDetailResponse
    createdBy: UserRead
    medicalRecords: List[MedicalRecordsResponse] = []
    diagnoses: List[DiagnosesResponse] = []
    medicationOrders: List[str] = []
