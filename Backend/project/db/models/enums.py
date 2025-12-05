import enum


class UserRoleEnum(str, enum.Enum):
    NURSE = "NURSE"
    DOCTOR = "DOCTOR"
    ASSISTANT = "ASSISTANT"
    ADMIN = "ADMIN"


class GenderEnum(str, enum.Enum):  # from `Sex`
    MALE = "MALE"
    FEMALE = "FEMALE"
    MX = "MX"
    OTHER = "OTHER"
    UNKNOWN = "UNKNOWN"


class PatientStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DISCHARGED = "DISCHARGED"
    DECEASED = "DECEASED"


class EncounterTypeEnum(str, enum.Enum):
    INPATIENT = "INPATIENT"  # opname
    OUTPATIENT = "OUTPATIENT"  # poliklinisch
    EMERGENCY = "EMERGENCY"
    TELEHEALTH = "TELEHEALTH"
    OTHER = "OTHER"


class EncounterStatusEnum(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MedicalRecordTypeEnum(str, enum.Enum):
    NOTE = "NOTE"
    CONSULTATION = "CONSULTATION"
    PROCEDURE_SUMMARY = "PROCEDURE_SUMMARY"
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY"
    REPORT = "REPORT"
    CHAT_SUMMARY = "CHAT_SUMMARY"


class DiagnosisTypeEnum(str, enum.Enum):
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    DIFFERENTIAL = "DIFFERENTIAL"


class MedicationStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    ON_HOLD = "ON_HOLD"


class LabResultStatusEnum(str, enum.Enum):
    REGISTERED = "REGISTERED"
    PRELIMINARY = "PRELIMINARY"
    FINAL = "FINAL"
    AMENDED = "AMENDED"


class VitalTypeEnum(str, enum.Enum):
    BLOOD_PRESSURE = "BLOOD_PRESSURE"
    TEMPERATURE = "TEMPERATURE"
    OXYGEN_SAT = "OXYGEN_SAT"
    HEART_RATE = "HEART_RATE"
    RESPIRATORY_RATE = "RESPIRATORY_RATE"


class AppointmentStatusEnum(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class InsuranceStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"
    PENDING = "PENDING"
