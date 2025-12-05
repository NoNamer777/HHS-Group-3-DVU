from typing import Annotated

from fastapi import APIRouter, Depends, status

from project.db.models.encounter import EncounterResponse, PaginatedEncounterResponse
from project.db.models.enums import EncounterStatusEnum, EncounterTypeEnum
from project.services.encounter_service import (
    create_encounter_service,
    delete_encounter_service,
    get_encounter_by_id_service,
    get_encounters_service,
    update_encounter_service,
)

router = APIRouter(
    prefix="/encounter",
    responses={404: {"description": "Encounter not found"}},
    tags=["Encounters"],
)


@router.get("/", status_code=status.HTTP_200_OK)
async def get_encounters(
    page: int | None = None,
    limit: int | None = None,
    encounter_id: int | None = None,
    encounter_status: EncounterStatusEnum | None = None,
    encounter_type: EncounterTypeEnum | None = None,
) -> PaginatedEncounterResponse:
    encounter_result = await get_encounters_service(
        page=page,
        limit=limit,
        encounter_id=encounter_id,
        encounter_status=encounter_status,
        encounter_type=encounter_type,
    )
    return encounter_result


@router.get("/{encounter_id}", status_code=status.HTTP_200_OK)
async def get_encounter(encounter_id: int) -> EncounterResponse:
    encounter = await get_encounter_by_id_service(encounter_id=encounter_id)
    return encounter


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_encounter(
    form_data: Annotated[EncounterResponse, Depends()],
) -> EncounterResponse:
    encounter = await create_encounter_service(form_data=form_data)
    return encounter


@router.put("/{encounter_id}", status_code=status.HTTP_200_OK)
async def update_encounter(
    encounter_id: int,
    form_data: Annotated[EncounterResponse, Depends()],
) -> EncounterResponse:
    encounter = await update_encounter_service(
        encounter_id=encounter_id, form_data=form_data
    )
    return encounter


@router.delete("/{encounter_id}", status_code=status.HTTP_200_OK)
async def delete_encounter(encounter_id: int) -> None:
    await delete_encounter_service(encounter_id=encounter_id)
