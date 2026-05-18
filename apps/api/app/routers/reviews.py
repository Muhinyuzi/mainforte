from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db

from app.core.security import get_current_user

from app.models.user import User
from app.models.job_post import JobPost
from app.models.application import JobApplication
from app.models.worker_profile import WorkerProfile
from app.models.review import Review

from app.schemas.review import (
    ReviewCreateSchema,
    ReviewSchema,
)

from app.constants.regions import TEMISCAMING_REGION


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"],
)


@router.post(
    "",
    response_model=ReviewSchema,
)
def create_review(
    payload: ReviewCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(JobPost).filter(
        JobPost.id == payload.job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Only completed jobs can be reviewed",
        )

    accepted_application = db.query(JobApplication).filter(
        JobApplication.job_id == job.id,
        JobApplication.status == "accepted",
    ).first()

    if not accepted_application:
        raise HTTPException(
            status_code=400,
            detail="No accepted application found",
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.id == accepted_application.worker_profile_id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found",
        )

    client_user_id = job.client_id
    worker_user_id = worker_profile.user_id

    allowed_pair = (
        current_user.id == client_user_id
        and payload.target_user_id == worker_user_id
    ) or (
        current_user.id == worker_user_id
        and payload.target_user_id == client_user_id
    )

    if not allowed_pair:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to review this user for this job",
        )

    existing_review = db.query(Review).filter(
        Review.job_id == job.id,
        Review.reviewer_user_id == current_user.id,
        Review.target_user_id == payload.target_user_id,
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="Review already submitted",
        )

    review = Review(
        job_id=job.id,
        reviewer_user_id=current_user.id,
        target_user_id=payload.target_user_id,
        rating=payload.rating,
        comment=payload.comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


@router.get(
    "/users/{user_id}",
)
def get_user_reviews(
    user_id: int,
    db: Session = Depends(get_db),
):
    reviews = db.query(Review).filter(
        Review.target_user_id == user_id
    ).order_by(
        Review.created_at.desc()
    ).all()

    average_rating = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.target_user_id == user_id
    ).scalar()

    return {
        "user_id": user_id,
        "average_rating": round(float(average_rating), 1)
        if average_rating
        else None,
        "reviews_count": len(reviews),
        "reviews": reviews,
    }


@router.get(
    "/jobs/{job_id}",
)
def get_job_reviews(
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

    reviews = db.query(Review).filter(
        Review.job_id == job_id
    ).order_by(
        Review.created_at.desc()
    ).all()

    return reviews