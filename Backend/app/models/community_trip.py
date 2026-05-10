import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class CommunityTrip(Base):
    __tablename__ = "community_trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    summary = Column(String, nullable=True)
    published_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    moderation_status = Column(String, nullable=False, default="approved")
    is_featured = Column(Boolean, nullable=False, default=False)

    source_trip = relationship("Trip")
    created_by_user = relationship("User")
