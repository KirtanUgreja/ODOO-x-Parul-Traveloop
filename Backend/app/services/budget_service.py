"""Budget service for CRUD operations on budget items."""

from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.budget_item import BudgetItem


class BudgetNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail={"code": "NOT_FOUND", "message": "Budget item not found"})


async def get_budget_items(db: AsyncSession, trip_id: str | UUID) -> List[BudgetItem]:
    """Get all budget items for a trip."""
    stmt = select(BudgetItem).where(BudgetItem.trip_id == trip_id).order_by(BudgetItem.category)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_budget_item(
    db: AsyncSession,
    trip_id: str | UUID,
    category: str,
    description: str,
    quantity: Decimal,
    unit_cost: Decimal,
) -> BudgetItem:
    """Create a new budget item."""
    amount = quantity * unit_cost
    item = BudgetItem(
        trip_id=trip_id,
        category=category,
        description=description,
        quantity=quantity,
        unit_cost=unit_cost,
        amount=amount,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def get_budget_item(db: AsyncSession, budget_item_id: str | UUID) -> BudgetItem:
    """Get a budget item by ID."""
    item = await db.get(BudgetItem, budget_item_id)
    if not item:
        raise BudgetNotFound()
    return item


async def update_budget_item(
    db: AsyncSession,
    budget_item_id: str | UUID,
    category: str | None = None,
    description: str | None = None,
    quantity: Decimal | None = None,
    unit_cost: Decimal | None = None,
) -> BudgetItem:
    """Update a budget item."""
    item = await get_budget_item(db, budget_item_id)
    
    if category is not None:
        item.category = category
    if description is not None:
        item.description = description
    if quantity is not None:
        item.quantity = quantity
    if unit_cost is not None:
        item.unit_cost = unit_cost
    
    # Recalculate amount
    item.amount = item.quantity * item.unit_cost
    
    await db.commit()
    await db.refresh(item)
    return item


async def delete_budget_item(db: AsyncSession, budget_item_id: str | UUID) -> None:
    """Delete a budget item."""
    item = await get_budget_item(db, budget_item_id)
    await db.delete(item)
    await db.commit()


async def calculate_budget_totals(db: AsyncSession, trip_id: str | UUID) -> dict:
    """Calculate total budget amounts for a trip."""
    items = await get_budget_items(db, trip_id)
    total = sum(item.amount for item in items)
    return {
        "total_budget": total,
        "item_count": len(items),
    }
