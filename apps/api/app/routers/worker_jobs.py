from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.job_post import JobPost
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.models.availability import Availability

from app.core.security import get_current_user

router = APIRouter(
    prefix="/workers/jobs",
    tags=["Worker Jobs"]
)


@router.get("/matches")
def get_matching_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "worker":
        raise HTTPException(
            status_code=403,
            detail="Only workers"
        )

    worker_profile = db.query(
        WorkerProfile
    ).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    skills = db.query(
        WorkerSkill
    ).filter(
        WorkerSkill.worker_id == worker_profile.id
    ).all()

    category_ids = [
        skill.category_id
        for skill in skills
    ]

    jobs = db.query(JobPost).filter(
        JobPost.category_id.in_(
            category_ids
        ),
        JobPost.city == worker_profile.city,
        JobPost.status == "open",
    ).all()

    results = []

    for job in jobs:

        score = 0

        # same city
        score += 40

        # category match
        score += 40

        # transport
        if worker_profile.transport_available:
            score += 10

        # hourly rate
        if worker_profile.hourly_rate:
            score += 10

        results.append({
            "job": job,
            "match_score": score,
        })

    return results