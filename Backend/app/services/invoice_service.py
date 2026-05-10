"""Invoice service for generating and managing invoices."""

from datetime import datetime
from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invoice import Invoice
from app.models.budget_item import BudgetItem
from app.models.trip import Trip
from app.models.user import User


class InvoiceNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "NOT_FOUND", "message": "Invoice not found"})


async def generate_invoice_number() -> str:
    """Generate a unique invoice number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    unique_id = str(UUID(int=0))[:8]
    return f"INV-{timestamp}-{unique_id}"


async def get_invoice_by_trip(db: AsyncSession, trip_id: str | UUID) -> Invoice | None:
    """Get invoice for a trip (if exists)."""
    stmt = select(Invoice).where(Invoice.trip_id == trip_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_invoice(db: AsyncSession, invoice_id: str | UUID) -> Invoice:
    """Get an invoice by ID."""
    invoice = await db.get(Invoice, invoice_id)
    if not invoice:
        raise InvoiceNotFound()
    return invoice


async def generate_or_update_invoice(
    db: AsyncSession,
    trip_id: str | UUID,
    tax_rate: Decimal = Decimal("0.05"),
    discount: Decimal = Decimal("0"),
) -> Invoice:
    """Generate or update an invoice from budget items."""
    # Calculate totals from budget items
    stmt = select(BudgetItem).where(BudgetItem.trip_id == trip_id)
    result = await db.execute(stmt)
    items: List[BudgetItem] = result.scalars().all()
    
    subtotal = sum(item.amount for item in items)
    tax = subtotal * tax_rate
    grand_total = subtotal + tax - discount
    
    # Check if invoice already exists
    existing = await get_invoice_by_trip(db, trip_id)
    
    if existing:
        existing.subtotal = subtotal
        existing.tax = tax
        existing.discount = discount
        existing.grand_total = grand_total
        existing.generated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing)
        return existing
    
    # Create new invoice
    invoice = Invoice(
        trip_id=trip_id,
        invoice_number=await generate_invoice_number(),
        status="pending",
        subtotal=subtotal,
        tax=tax,
        discount=discount,
        grand_total=grand_total,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice


async def update_invoice_status(
    db: AsyncSession,
    invoice_id: str | UUID,
    status: str,
) -> Invoice:
    """Update invoice status."""
    invoice = await get_invoice(db, invoice_id)
    invoice.status = status
    await db.commit()
    await db.refresh(invoice)
    return invoice


async def update_invoice_status_by_trip(
    db: AsyncSession,
    trip_id: str | UUID,
    status: str,
) -> Invoice:
    """Update invoice status by trip ID."""
    invoice = await get_invoice_by_trip(db, trip_id)
    if not invoice:
        raise InvoiceNotFound()
    invoice.status = status
    await db.commit()
    await db.refresh(invoice)
    return invoice


async def get_invoice_with_details(
    db: AsyncSession,
    trip_id: str | UUID,
) -> dict:
    """Get invoice with full details including budget items."""
    # Get invoice
    invoice = await get_invoice_by_trip(db, trip_id)
    if not invoice:
        # Generate if not exists
        invoice = await generate_or_update_invoice(db, trip_id)
    
    # Get budget items
    stmt = select(BudgetItem).where(BudgetItem.trip_id == trip_id)
    result = await db.execute(stmt)
    items = result.scalars().all()
    
    # Get trip details
    trip = await db.get(Trip, trip_id)
    user = await db.get(User, trip.user_id) if trip else None
    
    return {
        "invoice_id": invoice.invoice_number,
        "trip_name": trip.title if trip else "Unknown",
        "date_range": f"{trip.start_date} - {trip.end_date}" if trip and trip.start_date and trip.end_date else "N/A",
        "created_by": f"{user.first_name} {user.last_name}" if user else "Unknown",
        "travelers": [],
        "generated_date": invoice.generated_at.isoformat(),
        "status": invoice.status,
        "total_budget": invoice.subtotal,
        "total_spent": invoice.subtotal,
        "remaining": Decimal("0"),
        "items": [
            {
                "id": str(item.id),
                "category": item.category,
                "description": item.description,
                "qty": float(item.quantity),
                "unit_cost": float(item.unit_cost),
                "amount": float(item.amount),
            }
            for item in items
        ],
        "subtotal": float(invoice.subtotal),
        "tax": float(invoice.tax),
        "discount": float(invoice.discount),
        "grand_total": float(invoice.grand_total),
    }
