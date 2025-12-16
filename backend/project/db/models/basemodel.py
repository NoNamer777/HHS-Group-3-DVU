from typing import Optional

from pydantic import BaseModel


class DVUBaseModel(BaseModel):
    id: int
    createdAt: Optional[str] = None


class PaginationResponse(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int
