from typing import Annotated

from fastapi import APIRouter, Depends, status

from project.db.models.enums import PatientStatusEnum
from project.db.models.patient import PaginatedPatientResponse, PatientResponse
from project.services.patients_service import (
    create_patient_service,
    delete_patient_service,
    get_patient_by_id_service,
    get_patients_service,
    update_patient_service,
)

router = APIRouter(
    prefix="/patient",
    responses={404: {"description": "Patient not found"}},
    tags=["Patients"],
)


@router.get("/", status_code=status.HTTP_200_OK)
async def get_patients(
    limit: int | None = None,
    offset: int | None = None,
    patient_status: PatientStatusEnum | None = None,
    search: str | None = None,
) -> PaginatedPatientResponse:
    patient_result = await get_patients_service(
        limit=limit, offset=offset, patient_status=patient_status, search=search
    )
    return patient_result


@router.get("/{patient_id}", status_code=status.HTTP_200_OK)
async def get_patient(patient_id: int) -> PatientResponse:
    patient = await get_patient_by_id_service(patient_id=patient_id)
    return patient


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_patient(
    form_data: Annotated[PatientResponse, Depends()],
) -> PatientResponse:
    patient = await create_patient_service(form_data=form_data)
    return patient


@router.put("/{patient_id}", status_code=status.HTTP_200_OK)
async def update_patient(
    patient_id: int,
    form_data: Annotated[PatientResponse, Depends()],
) -> PatientResponse:
    patient = await update_patient_service(patient_id=patient_id, form_data=form_data)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_200_OK)
async def delete_patient(patient_id: int) -> None:
    await delete_patient_service(patient_id=patient_id)
