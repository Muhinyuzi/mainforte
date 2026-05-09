from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func

from app.db import Base


class JobPost(Base):
    __tablename__ = "job_posts"

    id = Column(Integer, primary_key=True)

    client_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(String)

    city = Column(String)

    address_optional = Column(String)

    needed_at = Column(DateTime(timezone=True))

    duration_estimate_hours = Column(Integer)

    urgency = Column(String)

    budget_type = Column(String)

    budget_amount = Column(Integer)

    status = Column(
        String,
        default="open"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )