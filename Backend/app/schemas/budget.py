from decimal import Decimal
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID


class BudgetItemBase(BaseModel):
    category: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    quantity: Decimal = Field(default=Decimal("1"), gt=0)
    unit_cost: Decimal = Field(..., gt=0)


class BudgetItemCreate(BaseModel):
    category: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    quantity: Decimal = Field(default=Decimal("1"), gt=0)
    unit_cost: Decimal = Field(..., gt=0)


class BudgetItemUpdate(BaseModel):
    category: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = Field(None, min_length=1)
    quantity: Optional[Decimal] = Field(None, gt=0)
    unit_cost: Optional[Decimal] = Field(None, gt=0)


class BudgetItemResponse(BaseModel):
    id: str
    trip_id: str
    category: str
    description: str
    quantity: Decimal
    unit_cost: Decimal
    amount: Decimal

    class Config:
        from_attributes = True


class BudgetResponse(BaseModel):
    trip_id: str
    items: List[BudgetItemResponse]
    total: Decimal
    item_count: int


class BudgetItemDetailResponse(BaseModel):
    id: str
    category: str
    description: str
    qty: float
    unit_cost: float
    amount: float


class InvoiceResponse(BaseModel):
    invoice_id: str
    trip_name: str
    date_range: str
    created_by: str
    travelers: List[str]
    generated_date: str
    status: str
    total_budget: Decimal
    total_spent: Decimal
    remaining: Decimal
    items: List[BudgetItemDetailResponse]
    subtotal: float
    tax: float
    discount: float
    grand_total: float


class InvoiceStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|paid|cancelled)$")


class BudgetTotalsResponse(BaseModel):
    total_budget: Decimal
    item_count: int
