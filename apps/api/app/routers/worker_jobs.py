from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.job_post import JobPost
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.models.availability import Availability
from app.models.application import JobApplication

from app.constants.regions import TEMISCAMING_REGION

from app.core.security import get_current_user
from app.utils.distance import get_city_distance_km


router = APIRouter(
    prefix="/workers/jobs",
    tags=["Worker Jobs"]
)


@router.get("/matches")
def get_matching_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.can_work:
        raise HTTPException(
            status_code=403,
            detail="Only users who can work"
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    if worker_profile.region != TEMISCAMING_REGION:
        return []

    skills = db.query(WorkerSkill).filter(
        WorkerSkill.worker_id == worker_profile.id
    ).all()

    category_ids = [
        skill.category_id
        for skill in skills
    ]

    availability = db.query(Availability).filter(
        Availability.worker_id == worker_profile.id,
        Availability.region == TEMISCAMING_REGION,
        Availability.status == "available",
    ).first()

    results = []
    added_job_ids = set()

    accepted_applications = db.query(JobApplication).filter(
        JobApplication.worker_profile_id == worker_profile.id,
        JobApplication.status == "accepted",
    ).all()

    for application in accepted_applications:
        job = db.query(JobPost).filter(
            JobPost.id == application.job_id,
            JobPost.region == TEMISCAMING_REGION,
        ).first()

        if not job:
            continue

        results.append({
            "job": job,
            "match_score": 999,
            "distance_km": None,
        })

        added_job_ids.add(job.id)

    if not availability:
        return results

    if not category_ids:
        return results

    jobs = db.query(JobPost).filter(
        JobPost.category_id.in_(category_ids),
        JobPost.region == TEMISCAMING_REGION,
        JobPost.status == "open",
    ).all()

    for job in jobs:
        if job.id in added_job_ids:
            continue

        distance_km = get_city_distance_km(
            availability.city,
            job.city,
        )

        if distance_km is None:
            continue

        if distance_km > 30:
            continue

        score = 0

        score += 40

        if distance_km <= 5:
            score += 30
        elif distance_km <= 15:
            score += 20
        elif distance_km <= 30:
            score += 10

        score += 40

        if worker_profile.transport_available:
            score += 10

        if worker_profile.hourly_rate:
            score += 10

        results.append({
            "job": job,
            "match_score": score,
            "distance_km": distance_km,
        })

    results.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return results