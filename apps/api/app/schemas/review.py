from datetime import datetime
from pydantic import BaseModel, Field


class ReviewCreateSchema(BaseModel):
    job_id: int
    target_user_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewSchema(BaseModel):
    id: int
    job_id: int
    reviewer_user_id: int
    target_user_id: int
    rating: int
    comment: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True