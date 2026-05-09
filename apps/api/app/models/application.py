from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func

from app.db import Base


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True)

    job_id = Column(
        Integer,
        ForeignKey("job_posts.id"),
        nullable=False
    )

    worker_profile_id = Column(
        Integer,
        ForeignKey("worker_profiles.id"),
        nullable=False
    )

    message = Column(String)

    proposed_rate = Column(Integer)

    status = Column(
        String,
        default="pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )