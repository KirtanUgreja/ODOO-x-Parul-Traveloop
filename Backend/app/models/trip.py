import uuid
from sqlalchemy import Column, Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="trips")
    city = relationship("City", back_populates="trips")
    sections = relationship("Section", back_populates="trip", order_by="Section.sort_order", cascade="all, delete-orphan")
