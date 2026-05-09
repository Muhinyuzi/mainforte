from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean
)

from app.db import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    slug = Column(
        String,
        unique=True,
        nullable=False
    )

    description = Column(String)

    is_active = Column(
        Boolean,
        default=True
    )