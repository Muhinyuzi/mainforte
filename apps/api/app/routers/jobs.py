from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.job_post import JobPost
from app.models.application import JobApplication
from app.models.worker_profile import WorkerProfile

from app.schemas.job import (
    JobCreateSchema,
    JobSchema,
)

from app.constants.regions import (
    TEMISCAMING_REGION,
    TEMISCAMING_CITIES,
)

from app.core.security import get_current_user

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)



@router.post(
    "",
    response_model=JobSchema,
)
def create_job(
    payload: JobCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.can_hire:
        raise HTTPException(
            status_code=403,
            detail="Only users who can hire can create jobs",
        )

    if payload.city not in TEMISCAMING_CITIES:
        raise HTTPException(
            status_code=400,
            detail="MainForte est disponible seulement au Témiscaming pour le moment.",
        )

    job = JobPost(
        client_id=current_user.id,
        category_id=payload.category_id,
        title=payload.title,
        description=payload.description,
        city=payload.city,
        region=TEMISCAMING_REGION,
        address_optional=payload.address_optional,
        needed_at=payload.needed_at,
        duration_estimate_hours=payload.duration_estimate_hours,
        urgency=payload.urgency,
        budget_type=payload.budget_type,
        budget_amount=payload.budget_amount,
        has_unread_activity=False,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get(
    "",
    response_model=list[JobSchema],
)
def list_jobs(
    db: Session = Depends(get_db),
):
    jobs = db.query(JobPost).filter(
        JobPost.region == TEMISCAMING_REGION
    ).all()

    return jobs


@router.post(
    "/{job_id}/mark-activity-read",
)
def mark_job_activity_read(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(JobPost).filter(
        JobPost.id == job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the job owner can mark activity as read",
        )

    job.has_unread_activity = False

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "ok": True,
        "job_id": job.id,
        "has_unread_activity": job.has_unread_activity,
    }


@router.get(
    "/{job_id}",
    response_model=JobSchema,
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = db.query(JobPost).filter(
        JobPost.id == job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return job


@router.patch(
    "/{job_id}/start",
    response_model=JobSchema,
)
def start_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(JobPost).filter(
        JobPost.id == job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    if job.status != "matched":
        raise HTTPException(
            status_code=400,
            detail="Job must be matched before starting",
        )

    application = db.query(JobApplication).filter(
        JobApplication.job_id == job.id,
        JobApplication.status == "accepted",
    ).first()

    if not application:
        raise HTTPException(
            status_code=400,
            detail="No accepted application found",
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.id == application.worker_profile_id,
        WorkerProfile.user_id == current_user.id,
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=403,
            detail="Only the accepted worker can start this job",
        )

    job.status = "in_progress"
    job.has_unread_activity = True

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.patch(
    "/{job_id}/complete",
    response_model=JobSchema,
)
def complete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(JobPost).filter(
        JobPost.id == job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    if job.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail="Job must be in progress before completion",
        )

    application = db.query(JobApplication).filter(
        JobApplication.job_id == job.id,
        JobApplication.status == "accepted",
    ).first()

    if not application:
        raise HTTPException(
            status_code=400,
            detail="No accepted application found",
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.id == application.worker_profile_id,
        WorkerProfile.user_id == current_user.id,
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=403,
            detail="Only the accepted worker can complete this job",
        )

    job.status = "completed"
    job.has_unread_activity = True

    db.add(job)
    db.commit()
    db.refresh(job)

    return job