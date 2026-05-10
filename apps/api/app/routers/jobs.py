from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.job_post import JobPost

from app.schemas.job import (
    JobCreateSchema,
    JobSchema
)

from app.core.security import get_current_user

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


@router.post(
    "",
    response_model=JobSchema
)
def create_job(
    payload: JobCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.can_hire:
        raise HTTPException(
            status_code=403,
            detail="Only users who can hire can create jobs"
        )

    job = JobPost(
        client_id=current_user.id,
        category_id=payload.category_id,
        title=payload.title,
        description=payload.description,
        city=payload.city,
        address_optional=payload.address_optional,
        needed_at=payload.needed_at,
        duration_estimate_hours=payload.duration_estimate_hours,
        urgency=payload.urgency,
        budget_type=payload.budget_type,
        budget_amount=payload.budget_amount,
    )

    db.add(job)

    db.commit()
    db.refresh(job)

    return job


@router.get(
    "",
    response_model=list[JobSchema]
)
def list_jobs(
    db: Session = Depends(get_db)
):
    jobs = db.query(JobPost).all()

    return jobs


@router.get(
    "/{job_id}",
    response_model=JobSchema
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(JobPost).filter(
        JobPost.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job