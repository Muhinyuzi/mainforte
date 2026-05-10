from sqlalchemy.orm import Session

from app.models.user import User
from app.models.job_post import JobPost
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill
from app.models.availability import Availability
from app.models.match import Match


def get_job_matches(
    db: Session,
    job: JobPost
):
    matches = []

    worker_profiles = (
        db.query(WorkerProfile)
        .join(
            User,
            User.id == WorkerProfile.user_id
        )
        .filter(
            User.can_work == True
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
            Availability.status == "available",
            Availability.city == job.city,
            Availability.start_datetime <= job.needed_at,
            Availability.end_datetime >= job.needed_at,
        ).first()

        if not availability:
            continue

        score = 0

        score += 40

        if availability.city == job.city:
            score += 30

        if worker.is_verified:
            score += 10

        if skill.experience_level == "experienced":
            score += 20

        matches.append({
            "worker_profile_id": worker.id,
            "user_id": worker.user_id,
            "city": worker.city,
            "hourly_rate": worker.hourly_rate,
            "experience_level": skill.experience_level,
            "score": score,
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
            status="suggested"
        )

        db.add(match)

        created_matches.append(match)

    db.commit()

    return created_matches