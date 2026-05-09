from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func

from app.db import Base


class Match(Base):
    __tablename__ = "matches"

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

    score = Column(Integer, default=0)

    status = Column(
        String,
        default="suggested"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )