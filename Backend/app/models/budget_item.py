import uuid
from decimal import Decimal
from sqlalchemy import Column, ForeignKey, String, Numeric
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)
    unit_cost = Column(Numeric(12, 2), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
