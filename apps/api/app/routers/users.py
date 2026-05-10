from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from app.db import get_db

from app.core.security import (
    get_current_user
)

from app.models.user import User

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
        current_user.bio = (
            payload.bio
        )

    if payload.city is not None:
        current_user.city = (
            payload.city
        )

    if payload.skills is not None:
        current_user.skills = (
            payload.skills
        )

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
        current_user.can_work = (
            payload.can_work
        )

    if payload.can_hire is not None:
        current_user.can_hire = (
            payload.can_hire
        )

    db.add(current_user)

    db.commit()

    db.refresh(current_user)

    return current_user