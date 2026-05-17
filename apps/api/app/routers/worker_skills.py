from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.user import User
from app.models.category import Category
from app.models.worker_profile import WorkerProfile
from app.models.worker_skill import WorkerSkill

from app.schemas.worker_skill import (
    WorkerSkillCreateSchema,
    WorkerSkillSchema
)

from app.constants.regions import TEMISCAMING_REGION

from app.core.security import get_current_user

router = APIRouter(
    prefix="/workers/skills",
    tags=["Worker Skills"]
)


@router.post(
    "",
    response_model=WorkerSkillSchema
)
def create_worker_skill(
    payload: WorkerSkillCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not current_user.can_work:
        raise HTTPException(
            status_code=403,
            detail="Only users who can work can add skills"
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id,
        WorkerProfile.region == TEMISCAMING_REGION,
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    category = db.query(Category).filter(
        Category.id == payload.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Invalid category_id"
        )

    existing_skill = db.query(WorkerSkill).filter(
        WorkerSkill.worker_id == worker_profile.id,
        WorkerSkill.category_id == payload.category_id
    ).first()

    if existing_skill:
        raise HTTPException(
            status_code=400,
            detail="Skill already added"
        )

    skill = WorkerSkill(
        worker_id=worker_profile.id,
        category_id=payload.category_id,
        experience_level=payload.experience_level,
    )

    db.add(skill)

    db.commit()
    db.refresh(skill)

    return skill


@router.get(
    "/me",
    response_model=list[WorkerSkillSchema]
)
def get_my_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not current_user.can_work:
        raise HTTPException(
            status_code=403,
            detail="Only users who can work"
        )

    worker_profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id,
        WorkerProfile.region == TEMISCAMING_REGION,
    ).first()

    if not worker_profile:
        raise HTTPException(
            status_code=404,
            detail="Worker profile not found"
        )

    skills = db.query(WorkerSkill).filter(
        WorkerSkill.worker_id == worker_profile.id
    ).all()

    return skills