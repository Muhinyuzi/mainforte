from pydantic import BaseModel


class WorkerProfileCreateSchema(BaseModel):
    bio: str | None = None
    city: str
    region: str
    transport_available: bool = False
    hourly_rate: int | None = None


class WorkerProfileSchema(BaseModel):
    id: int
    user_id: int

    bio: str | None = None

    city: str
    region: str

    transport_available: bool
    hourly_rate: int | None = None

    is_verified: bool

    class Config:
        from_attributes = True