# app/models/city.py

from sqlalchemy import Column, Integer, String, Float

from app.db import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, unique=True, nullable=False)

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)