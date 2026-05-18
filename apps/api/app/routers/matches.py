from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.job_post import JobPost
from app.models.match import Match

from app.services.matching_service import (
    get_job_matches,
    generate_and_store_matches
)

from app.constants.regions import (
    TEMISCAMING_REGION,
)

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)


@router.get("/jobs/{job_id}")
def get_matches_for_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(JobPost).filter(
        JobPost.id == job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    matches = get_job_matches(
        db=db,
        job=job
    )

    return {
        "job_id": job.id,
        "job_title": job.title,
        "matches_count": len(matches),
        "matches": matches,
    }


@router.post("/jobs/{job_id}/generate")
def generate_matches(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(JobPost).filter(
        JobPost.id == job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    matches = generate_and_store_matches(
        db=db,
        job=job
    )

    return {
        "job_id": job.id,
        "generated_matches": len(matches)
    }


@router.get("/jobs/{job_id}/stored")
def get_stored_matches(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(JobPost).filter(
        JobPost.id == job_id,
        JobPost.region == TEMISCAMING_REGION,
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    matches = db.query(Match).filter(
        Match.job_id == job_id
    ).all()

    return matches