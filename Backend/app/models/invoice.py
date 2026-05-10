import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, ForeignKey, String, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False, unique=True)
    invoice_number = Column(String, nullable=False, unique=True)
    status = Column(String, nullable=False, default="pending")
    generated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    subtotal = Column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    tax = Column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    discount = Column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    grand_total = Column(Numeric(12, 2), nullable=False, default=Decimal("0"))
