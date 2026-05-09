from datetime import datetime

from pydantic import BaseModel


class JobCreateSchema(BaseModel):
    category_id: int

    title: str

    description: str | None = None

    city: str

    address_optional: str | None = None

    needed_at: datetime

    duration_estimate_hours: int | None = None

    urgency: str

    budget_type: str

    budget_amount: int | None = None


class JobSchema(BaseModel):
    id: int

    client_id: int

    category_id: int

    title: str

    description: str | None = None

    city: str

    address_optional: str | None = None

    needed_at: datetime

    duration_estimate_hours: int | None = None

    urgency: str

    budget_type: str

    budget_amount: int | None = None

    status: str

    class Config:
        from_attributes = True