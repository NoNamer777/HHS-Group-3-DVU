from datetime import datetime

from pydantic import BaseModel


class DVUBaseModel(BaseModel):
    id: int
    createdAt: datetime
