from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.db import Base


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    bio = Column(String)

    city = Column(String)

    region = Column(String)

    transport_available = Column(
        Boolean,
        default=False
    )

    hourly_rate = Column(Integer)

    is_verified = Column(
        Boolean,
        default=False
    )

    user = relationship("User")