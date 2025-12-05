from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, status

from project.db.models.enums import PatientStatusEnum
from project.db.models.patient import PaginatedPatientResponse, PatientResponse
from project.globals import EPD_URL

url_prefix = f"{EPD_URL}/patient"


async def get_patients_service(
    limit: int | None = None,
    offset: int | None = None,
    patient_status: PatientStatusEnum | None = None,
    search: str | None = None,
) -> PaginatedPatientResponse:
    """
    Get all patients
    """

    epd_url = url_prefix
    params = {
        "limit": limit,
        "offset": offset,
        "status": patient_status.value if patient_status else None,
        "search": search,
    }
    params = {k: v for k, v in params.items() if v is not None}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(epd_url, params=params)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return PaginatedPatientResponse.model_validate(data)


async def get_patient_by_id_service(patient_id: int) -> PatientResponse:
    """
    Get a patient by uuid
    """
    epd_url = url_prefix
    params = {"id": patient_id}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(epd_url, params=params)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return PatientResponse.model_validate(data)


async def create_patient_service(
    form_data: Annotated[PatientResponse, Depends()],
) -> PatientResponse:
    """
    Create a new patient
    """

    epd_url = url_prefix
    payload = form_data.model_dump(by_alias=True)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(epd_url, json=payload)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return PatientResponse.model_validate(data)


async def update_patient_service(
    patient_id: int, form_data: Annotated[PatientResponse, Depends()]
) -> PatientResponse:
    """
    Update info on a patient
    """

    epd_url = url_prefix
    params = {"id": patient_id}
    payload = form_data.model_dump(by_alias=True)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(epd_url, params=params, json=payload)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc

    data = response.json()
    return PatientResponse.model_validate(data)


async def delete_patient_service(patient_id: int) -> None:
    """
    Delete a patient
    """
    epd_url = url_prefix
    params = {"id": patient_id}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(epd_url, params=params)
            response.raise_for_status()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="EPD niet bereikbaar"
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc
