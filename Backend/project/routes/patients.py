from typing import Annotated

from fastapi import APIRouter, Depends, status

from project.db.models.details import PatientDetailResponse
from project.db.models.enums import PatientStatusEnum
from project.db.models.patient import PaginatedPatientResponse
from project.db.models.patient_base import PatientResponse
from project.services.auth_service import get_bearer_token
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


@router.get(
    "/", response_model=PaginatedPatientResponse, status_code=status.HTTP_200_OK
)
async def get_patients(
    token: str = Depends(get_bearer_token),
    limit: int | None = None,
    offset: int | None = None,
    patient_status: PatientStatusEnum | None = None,
    search: str | None = None,
) -> PaginatedPatientResponse:
    patient_result = await get_patients_service(
        limit=limit,
        offset=offset,
        patient_status=patient_status,
        search=search,
        token=token,
    )
    return patient_result


@router.get(
    "/{patient_id}",
    response_model=PatientDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def get_patient(
    patient_id: int, token: str = Depends(get_bearer_token)
) -> PatientDetailResponse:
    patient = await get_patient_by_id_service(patient_id=patient_id, token=token)
    return patient


@router.post(
    "/", response_model=PatientDetailResponse, status_code=status.HTTP_201_CREATED
)
async def create_patient(
    form_data: Annotated[PatientResponse, Depends()],
    token: str = Depends(get_bearer_token),
) -> PatientDetailResponse:
    patient = await create_patient_service(form_data=form_data, token=token)
    return patient


@router.put(
    "/{patient_id}",
    response_model=PatientDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def update_patient(
    patient_id: int,
    form_data: Annotated[PatientResponse, Depends()],
    token: str = Depends(get_bearer_token),
) -> PatientDetailResponse:
    patient = await update_patient_service(
        patient_id=patient_id, form_data=form_data, token=token
    )
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_200_OK)
async def delete_patient(
    patient_id: int, token: str = Depends(get_bearer_token)
) -> None:
    await delete_patient_service(patient_id=patient_id, token=token)
