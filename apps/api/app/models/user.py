from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    Float
)

from sqlalchemy.sql import func

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    hashed_password = Column(
        String,
        nullable=False
    )

    full_name = Column(
        String,
        nullable=False
    )

    phone = Column(String)

    role = Column(
        String,
        nullable=False
    )

    can_work = Column(Boolean, default=False)

    can_hire = Column(Boolean, default=True)

    is_active = Column(
        Boolean,
        default=True
    )

    # PROFILE

    bio = Column(Text)

    city = Column(String)

    skills = Column(Text)

    hourly_rate = Column(Float)

    profile_picture_url = Column(
        String
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )