from sqlalchemy.orm import Session

from app.models.user import User
from app.models.job_post import JobPost
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.models.availability import Availability
from app.models.match import Match

from app.constants.regions import TEMISCAMING_REGION

from app.utils.distance import get_city_distance_km


def get_job_matches(
    db: Session,
    job: JobPost
):
    matches = []

    if job.region != TEMISCAMING_REGION:
        return matches

    worker_profiles = (
        db.query(WorkerProfile)
        .join(
            User,
            User.id == WorkerProfile.user_id
        )
        .filter(
            User.can_work.is_(True),
            WorkerProfile.region == TEMISCAMING_REGION,
        )
        .all()
    )

    for worker in worker_profiles:
        skill = db.query(WorkerSkill).filter(
            WorkerSkill.worker_id == worker.id,
            WorkerSkill.category_id == job.category_id
        ).first()

        if not skill:
            continue

        availability = db.query(Availability).filter(
            Availability.worker_id == worker.id,
            Availability.region == TEMISCAMING_REGION,
            Availability.status == "available",
            Availability.start_datetime <= job.needed_at,
            Availability.end_datetime >= job.needed_at,
        ).first()

        if not availability:
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

        if worker.is_verified:
            score += 10

        if skill.experience_level == "experienced":
            score += 20

        matches.append({
            "worker_profile_id": worker.id,
            "user_id": worker.user_id,
            "city": worker.city,
            "region": worker.region,
            "hourly_rate": worker.hourly_rate,
            "experience_level": skill.experience_level,
            "score": score,
            "distance_km": distance_km,
        })

    matches.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return matches


def generate_and_store_matches(
    db: Session,
    job: JobPost
):
    generated_matches = get_job_matches(
        db=db,
        job=job
    )

    created_matches = []

    for item in generated_matches:
        existing_match = db.query(Match).filter(
            Match.job_id == job.id,
            Match.worker_profile_id == item["worker_profile_id"]
        ).first()

        if existing_match:
            continue

        match = Match(
            job_id=job.id,
            worker_profile_id=item["worker_profile_id"],
            score=item["score"],
            distance_km=item["distance_km"],
            status="suggested"
        )

        db.add(match)

        created_matches.append(match)

    db.commit()

    return created_matches