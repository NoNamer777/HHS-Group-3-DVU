from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, status

from project.db.models.encounter import EncounterResponse, PaginatedEncounterResponse
from project.db.models.enums import EncounterStatusEnum, EncounterTypeEnum
from project.globals import EPD_URL

url_prefix = f"{EPD_URL}/encounters"


async def get_encounters_service(
    page: int | None = None,
    limit: int | None = None,
    encounter_id: int | None = None,
    encounter_status: EncounterStatusEnum | None = None,
    encounter_type: EncounterTypeEnum | None = None,
) -> PaginatedEncounterResponse:
    """
    Get all encounters
    """

    epd_url = url_prefix
    params = {
        "page": page,
        "limit": limit,
        "encounterId": encounter_id,
        "status": encounter_status,
        "type": encounter_type,
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
    return PaginatedEncounterResponse.model_validate(data)


async def get_encounter_by_id_service(encounter_id: int) -> EncounterResponse:
    """
    Get a encounter by uuid
    """
    epd_url = url_prefix
    params = {"id": encounter_id}

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
    return EncounterResponse.model_validate(data)


async def create_encounter_service(
    form_data: Annotated[EncounterResponse, Depends()],
) -> EncounterResponse:
    """
    Create a new encounter
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
    return EncounterResponse.model_validate(data)


async def update_encounter_service(
    encounter_id: int, form_data: Annotated[EncounterResponse, Depends()]
) -> EncounterResponse:
    """
    Update info on an encounter
    """

    epd_url = url_prefix
    params = {"id": encounter_id}
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
    return EncounterResponse.model_validate(data)


async def delete_encounter_service(encounter_id: int) -> None:
    """
    Delete an encounter
    """
    epd_url = url_prefix
    params = {"id": encounter_id}

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
