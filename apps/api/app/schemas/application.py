from pydantic import BaseModel


class JobApplicationCreateSchema(BaseModel):
    message: str | None = None
    proposed_rate: int | None = None

class WorkerInfoSchema(BaseModel):
    id: int
    full_name: str
    city: str | None = None
    skills: str | None = None
    hourly_rate: float | None = None

    class Config:
        from_attributes = True       


class JobApplicationSchema(BaseModel):
    id: int

    job_id: int

    worker_profile_id: int

    message: str | None = None

    proposed_rate: int | None = None

    status: str

    worker: WorkerInfoSchema

    class Config:
        from_attributes = True

     