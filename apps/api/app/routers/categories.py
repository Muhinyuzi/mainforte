from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db

from app.models.category import Category


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.get("")
def list_categories(
    db: Session = Depends(get_db)
):
    categories = db.query(Category).filter(
        Category.is_active == True
    ).order_by(
        Category.name.asc()
    ).all()

    return categories