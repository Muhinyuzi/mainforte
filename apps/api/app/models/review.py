# app/models/review.py

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)

from sqlalchemy.sql import func

from app.db import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)

    job_id = Column(
        Integer,
        ForeignKey("job_posts.id"),
        nullable=False,
    )

    reviewer_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    target_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    comment = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    __table_args__ = (
        UniqueConstraint(
            "job_id",
            "reviewer_user_id",
            "target_user_id",
            name="uq_review_job_reviewer_target",
        ),
    )