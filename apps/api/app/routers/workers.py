from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.worker_profile import WorkerProfile

from app.schemas.worker import (
    WorkerProfileCreateSchema,
    WorkerProfileSchema
)

from app.core.security import get_current_user

router = APIRouter(
    prefix="/workers",
    tags=["Workers"]
)


@router.post(
    "/profile",
    response_model=WorkerProfileSchema
)
def create_worker_profile(
    payload: WorkerProfileCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "worker":
        raise HTTPException(
            status_code=403,
            detail="Only workers can create worker profiles"
        )

    existing_profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Worker profile already exists"
        )

    profile = WorkerProfile(
        user_id=current_user.id,
        bio=payload.bio,
        city=payload.city,
        region=payload.region,
        transport_available=payload.transport_available,
        hourly_rate=payload.hourly_rate,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "/profile/me",
    response_model=WorkerProfileSchema
)
def get_my_worker_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    return profile