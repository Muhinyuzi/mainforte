from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db

from app.core.security import (
    get_current_user
)

from app.models.user import User
from app.models.worker_profile import WorkerProfile
from app.models.job_post import JobPost
from app.models.review import Review

from app.schemas.user import (
    UserMeSchema,
    UserProfileUpdate
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get(
    "/me",
    response_model=UserMeSchema
)
def get_me(
    current_user: User = Depends(
        get_current_user
    )
):
    return current_user


@router.patch(
    "/me",
    response_model=UserMeSchema
)
def update_me(
    payload: UserProfileUpdate,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )
):
    if payload.bio is not None:
        current_user.bio = payload.bio

    if payload.city is not None:
        current_user.city = payload.city

    if payload.skills is not None:
        current_user.skills = payload.skills

    if payload.hourly_rate is not None:
        current_user.hourly_rate = (
            payload.hourly_rate
        )

    if (
        payload.profile_picture_url
        is not None
    ):
        current_user.profile_picture_url = (
            payload.profile_picture_url
        )

    if payload.can_work is not None:
        current_user.can_work = payload.can_work

    if payload.can_hire is not None:
        current_user.can_hire = payload.can_hire

    worker_profile = db.query(
        WorkerProfile
    ).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if current_user.can_work:
        if not worker_profile:
            worker_profile = WorkerProfile(
                user_id=current_user.id
            )

            db.add(worker_profile)

        worker_profile.city = current_user.city
        worker_profile.bio = current_user.bio
        worker_profile.hourly_rate = (
            current_user.hourly_rate
        )

    db.add(current_user)

    db.commit()

    db.refresh(current_user)

    return current_user

@router.get("/workers/{user_id}/public")
def get_public_worker_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id,
        User.can_work == True
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    completed_jobs_count = db.query(JobPost).join(
        WorkerProfile,
        WorkerProfile.user_id == user.id
    ).filter(
        JobPost.status == "completed"
    ).count()

    average_rating = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.target_user_id == user.id
    ).scalar()

    reviews_count = db.query(Review).filter(
        Review.target_user_id == user.id
    ).count()

    reviews = db.query(Review).filter(
        Review.target_user_id == user.id
    ).order_by(
        Review.created_at.desc()
    ).limit(10).all()

    return {
        "id": user.id,
        "full_name": user.full_name,
        "city": user.city,
        "bio": user.bio,
        "skills": user.skills,
        "hourly_rate": user.hourly_rate,
        "profile_picture_url": user.profile_picture_url,
        "average_rating": round(float(average_rating), 1)
        if average_rating
        else None,
        "reviews_count": reviews_count,
        "completed_jobs_count": completed_jobs_count,
        "reviews": reviews,
    }


@router.get("/clients/{user_id}/public")
def get_public_client_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id,
        User.can_hire == True
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    posted_jobs_count = db.query(JobPost).filter(
        JobPost.client_id == user.id
    ).count()

    completed_jobs_count = db.query(JobPost).filter(
        JobPost.client_id == user.id,
        JobPost.status == "completed"
    ).count()

    average_rating = db.query(
        func.avg(Review.rating)
    ).filter(
        Review.target_user_id == user.id
    ).scalar()

    reviews_count = db.query(Review).filter(
        Review.target_user_id == user.id
    ).count()

    reviews = db.query(Review).filter(
        Review.target_user_id == user.id
    ).order_by(
        Review.created_at.desc()
    ).limit(10).all()

    return {
        "id": user.id,
        "full_name": user.full_name,
        "city": user.city,
        "bio": user.bio,
        "profile_picture_url": user.profile_picture_url,
        "average_rating": round(float(average_rating), 1)
        if average_rating
        else None,
        "reviews_count": reviews_count,
        "posted_jobs_count": posted_jobs_count,
        "completed_jobs_count": completed_jobs_count,
        "reviews": reviews,
    }

@router.get("/workers/{user_id}")
def get_public_worker_profile_short(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_public_worker_profile(
        user_id=user_id,
        db=db
    )


@router.get("/clients/{user_id}")
def get_public_client_profile_short(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_public_client_profile(
        user_id=user_id,
        db=db
    )


@router.get("/workers")
def list_workers(
    db: Session = Depends(get_db)
):
    workers = db.query(User).filter(
        User.can_work == True
    ).all()

    results = []

    for user in workers:

        completed_jobs_count = db.query(
            JobPost
        ).join(
            WorkerProfile,
            WorkerProfile.user_id == user.id
        ).filter(
            JobPost.status == "completed"
        ).count()

        average_rating = db.query(
            func.avg(Review.rating)
        ).filter(
            Review.target_user_id == user.id
        ).scalar()

        reviews_count = db.query(
            Review
        ).filter(
            Review.target_user_id == user.id
        ).count()

        results.append({
            "id": user.id,
            "full_name": user.full_name,
            "city": user.city,
            "bio": user.bio,
            "skills": user.skills,
            "hourly_rate": user.hourly_rate,
            "profile_picture_url":
                user.profile_picture_url,

            "average_rating":
                round(float(average_rating), 1)
                if average_rating
                else None,

            "reviews_count":
                reviews_count,

            "completed_jobs_count":
                completed_jobs_count,
        })

    return results

@router.get("/clients")
def list_clients(
    db: Session = Depends(get_db)
):
    clients = db.query(User).filter(
        User.can_hire == True
    ).all()

    results = []

    for user in clients:

        posted_jobs_count = db.query(
            JobPost
        ).filter(
            JobPost.client_id == user.id
        ).count()

        completed_jobs_count = db.query(
            JobPost
        ).filter(
            JobPost.client_id == user.id,
            JobPost.status == "completed"
        ).count()

        average_rating = db.query(
            func.avg(Review.rating)
        ).filter(
            Review.target_user_id == user.id
        ).scalar()

        reviews_count = db.query(
            Review
        ).filter(
            Review.target_user_id == user.id
        ).count()

        results.append({
            "id": user.id,
            "full_name": user.full_name,
            "city": user.city,
            "bio": user.bio,
            "profile_picture_url":
                user.profile_picture_url,

            "average_rating":
                round(float(average_rating), 1)
                if average_rating
                else None,

            "reviews_count":
                reviews_count,

            "posted_jobs_count":
                posted_jobs_count,

            "completed_jobs_count":
                completed_jobs_count,
        })

    return results