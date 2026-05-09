from datetime import datetime

from pydantic import BaseModel


class AvailabilityCreateSchema(BaseModel):
    availability_type: str

    start_datetime: datetime
    end_datetime: datetime

    city: str

    max_distance_km: int = 25

    note: str | None = None


class AvailabilitySchema(BaseModel):
    id: int

    worker_id: int

    availability_type: str

    start_datetime: datetime
    end_datetime: datetime

    city: str

    max_distance_km: int

    status: str

    note: str | None = None

    class Config:
        from_attributes = True