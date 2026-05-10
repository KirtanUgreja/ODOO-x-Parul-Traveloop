import uuid
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class Section(Base):
    __tablename__ = "sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    title = Column(String, nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    trip = relationship("Trip", back_populates="sections")
    activities = relationship("SectionActivity", back_populates="section", order_by="SectionActivity.sort_order", cascade="all, delete-orphan")
