from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.job_post import JobPost
from app.models.worker_profile import WorkerProfile
from app.models.application import JobApplication
from app.models.match import Match
from app.models.availability import Availability
from app.models.conversation import Conversation

from app.schemas.application import (
    JobApplicationCreateSchema,
    JobApplicationSchema
)

from app.core.security import get_current_user

router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


def serialize_application(
    application: JobApplication,
    db: Session
):
    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.id == application.worker_profile_id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    worker_user = db.query(User).filter(
        User.id == worker_profile.user_id
    ).first()

    if not worker_user:
        raise HTTPException(
            status_code=404,
            detail="Worker user not found"
        )

    return {
        "id": application.id,
        "job_id": application.job_id,
        "worker_profile_id": application.worker_profile_id,
        "message": application.message,
        "proposed_rate": application.proposed_rate,
        "status": application.status,
        "worker": {
            "id": worker_user.id,
            "full_name": worker_user.full_name,
            "city": worker_user.city,
            "skills": worker_user.skills,
            "hourly_rate": worker_user.hourly_rate,
        },
    }


@router.post(
    "/jobs/{job_id}",
    response_model=JobApplicationSchema
)
def apply_to_job(
    job_id: int,
    payload: JobApplicationCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=403,
            detail="Only workers can apply"
        )

    job = db.query(JobPost).filter(
        JobPost.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    existing_application = db.query(JobApplication).filter(
        JobApplication.job_id == job.id,
        JobApplication.worker_profile_id == worker_profile.id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=400,
            detail="Already applied"
        )

    application = JobApplication(
        job_id=job.id,
        worker_profile_id=worker_profile.id,
        message=payload.message,
        proposed_rate=payload.proposed_rate,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return serialize_application(
        application,
        db
    )


@router.get(
    "/jobs/{job_id}",
    response_model=list[JobApplicationSchema]
)
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db)
):
    applications = db.query(JobApplication).filter(
        JobApplication.job_id == job_id
    ).all()

    return [
        serialize_application(
            application,
            db
        )
        for application in applications
    ]


@router.patch(
    "/{application_id}/accept",
    response_model=JobApplicationSchema
)
def accept_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    job = db.query(JobPost).filter(
        JobPost.id == application.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed"
        )

    existing_accepted = db.query(JobApplication).filter(
        JobApplication.job_id == job.id,
        JobApplication.status == "accepted"
    ).first()

    if existing_accepted:
        raise HTTPException(
            status_code=400,
            detail="Job already has an accepted application"
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.id == application.worker_profile_id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    application.status = "accepted"
    job.status = "matched"

    existing_conversation = db.query(Conversation).filter(
        Conversation.job_id == job.id,
        Conversation.client_id == job.client_id,
        Conversation.worker_id == worker_profile.user_id
    ).first()

    if not existing_conversation:
        conversation = Conversation(
            job_id=job.id,
            client_id=job.client_id,
            worker_id=worker_profile.user_id,
        )

        db.add(conversation)

    match = db.query(Match).filter(
        Match.job_id == job.id,
        Match.worker_profile_id == application.worker_profile_id
    ).first()

    if match:
        match.status = "accepted"

    availability = db.query(Availability).filter(
        Availability.worker_id == application.worker_profile_id,
        Availability.status == "available",
        Availability.start_datetime <= job.needed_at,
        Availability.end_datetime >= job.needed_at,
    ).first()

    if availability:
        availability.status = "booked"

    db.commit()
    db.refresh(application)

    return serialize_application(
        application,
        db
    )


@router.patch(
    "/{application_id}/reject",
    response_model=JobApplicationSchema
)
def reject_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    job = db.query(JobPost).filter(
        JobPost.id == application.job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not allowed"
        )

    application.status = "rejected"

    match = db.query(Match).filter(
        Match.job_id == job.id,
        Match.worker_profile_id == application.worker_profile_id
    ).first()

    if match:
        match.status = "rejected"

    db.commit()
    db.refresh(application)

    return serialize_application(
        application,
        db
    )


@router.get("/me")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "worker":
        raise HTTPException(
            status_code=403,
            detail="Only workers"
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    applications = db.query(JobApplication).filter(
        JobApplication.worker_profile_id == worker_profile.id
    ).all()

    return [
        serialize_application(
            application,
            db
        )
        for application in applications
    ]