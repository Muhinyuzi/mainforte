from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from app.db import Base


class WorkerSkill(Base):
    __tablename__ = "worker_skills"

    id = Column(Integer, primary_key=True)

    worker_id = Column(
        Integer,
        ForeignKey("worker_profiles.id"),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )

    experience_level = Column(String)