from typing import Annotated

from fastapi import APIRouter, Depends, status

from project.db.models.details import EncounterDetailResponse
from project.db.models.encounter import (
    EncounterResponse,
    PaginatedEncounterResponse,
)
from project.db.models.enums import EncounterStatusEnum, EncounterTypeEnum
from project.services.auth_service import get_bearer_token
from project.services.encounter_service import (
    create_encounter_service,
    delete_encounter_service,
    get_encounter_by_id_service,
    get_encounters_service,
    update_encounter_service,
)

router = APIRouter(
    prefix="/encounters",
    responses={404: {"description": "Encounter not found"}},
    tags=["Encounters"],
)


@router.get(
    "/", response_model=PaginatedEncounterResponse, status_code=status.HTTP_200_OK
)
async def get_encounters(
    token: str = Depends(get_bearer_token),
    page: int | None = None,
    limit: int | None = None,
    encounter_id: int | None = None,
    encounter_status: EncounterStatusEnum | None = None,
    encounter_type: EncounterTypeEnum | None = None,
) -> PaginatedEncounterResponse:
    encounter_result = await get_encounters_service(
        token=token,
        page=page,
        limit=limit,
        encounter_id=encounter_id,
        encounter_status=encounter_status,
        encounter_type=encounter_type,
    )
    return encounter_result


@router.get(
    "/{encounter_id}",
    response_model=EncounterDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def get_encounter(
    encounter_id: int, token: str = Depends(get_bearer_token)
) -> EncounterDetailResponse:
    encounter = await get_encounter_by_id_service(
        encounter_id=encounter_id, token=token
    )
    return encounter


@router.post(
    "/", response_model=EncounterDetailResponse, status_code=status.HTTP_201_CREATED
)
async def create_encounter(
    form_data: Annotated[EncounterResponse, Depends()],
    token: str = Depends(get_bearer_token),
) -> EncounterDetailResponse:
    encounter = await create_encounter_service(form_data=form_data, token=token)
    return encounter


@router.put(
    "/{encounter_id}",
    response_model=EncounterDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def update_encounter(
    encounter_id: int,
    form_data: Annotated[EncounterResponse, Depends()],
    token: str = Depends(get_bearer_token),
) -> EncounterDetailResponse:
    encounter = await update_encounter_service(
        encounter_id=encounter_id, form_data=form_data, token=token
    )
    return encounter


@router.delete("/{encounter_id}", status_code=status.HTTP_200_OK)
async def delete_encounter(
    encounter_id: int, token: str = Depends(get_bearer_token)
) -> None:
    await delete_encounter_service(encounter_id=encounter_id, token=token)
