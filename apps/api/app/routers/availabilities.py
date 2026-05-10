from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.worker_profile import WorkerProfile
from app.models.availability import Availability

from app.schemas.availability import (
    AvailabilityCreateSchema,
    AvailabilitySchema
)

from app.core.security import get_current_user

router = APIRouter(
    prefix="/availabilities",
    tags=["Availabilities"]
)


@router.post(
    "",
    response_model=AvailabilitySchema
)
def create_availability(
    payload: AvailabilityCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.can_work:
        raise HTTPException(
            status_code=403,
            detail="Only users who can work can create availability"
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    availability = Availability(
        worker_id=worker_profile.id,
        availability_type=payload.availability_type,
        start_datetime=payload.start_datetime,
        end_datetime=payload.end_datetime,
        city=payload.city,
        max_distance_km=payload.max_distance_km,
        note=payload.note,
    )

    db.add(availability)

    db.commit()
    db.refresh(availability)

    return availability


@router.get(
    "/me",
    response_model=list[AvailabilitySchema]
)
def get_my_availabilities(
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

    availabilities = db.query(Availability).filter(
        Availability.worker_id == worker_profile.id
    ).all()

    return availabilities


@router.get(
    "/available",
    response_model=list[AvailabilitySchema]
)
def get_available_workers(
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()

    availabilities = db.query(Availability).filter(
        Availability.status == "available",
        Availability.end_datetime >= now
    ).all()

    return availabilities