from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db import Base


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True)

    worker_id = Column(
        Integer,
        ForeignKey("worker_profiles.id"),
        nullable=False
    )

    availability_type = Column(String)

    start_datetime = Column(DateTime(timezone=True))

    end_datetime = Column(DateTime(timezone=True))

    city = Column(String, nullable=False)

    region = Column(String, nullable=False)

    max_distance_km = Column(Integer)

    status = Column(
        String,
        default="available"
    )

    note = Column(String)


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )