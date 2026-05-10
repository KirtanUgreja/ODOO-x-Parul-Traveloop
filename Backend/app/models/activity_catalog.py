import uuid
from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class ActivityCatalog(Base):
    __tablename__ = "activity_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=True)
    tags = Column(String, nullable=True)
