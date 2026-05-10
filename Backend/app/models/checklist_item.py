import uuid
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    text = Column(String, nullable=False)
    is_done = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)
