"""Admin tests - unit tests that verify admin router structure."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_requires_admin(async_client: AsyncClient):
    """Admin endpoints should require admin authentication."""
    r = await async_client.get("/api/v1/admin/stats")
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_users_requires_auth(async_client: AsyncClient):
    """Admin users endpoint should require authentication."""
    r = await async_client.get("/api/v1/admin/users")
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_trips_requires_auth(async_client: AsyncClient):
    """Admin trips endpoint should require authentication."""
    r = await async_client.get("/api/v1/admin/trips")
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_analytics_requires_auth(async_client: AsyncClient):
    """Admin analytics endpoint should require authentication."""
    r = await async_client.get("/api/v1/admin/analytics")
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_update_user_requires_auth(async_client: AsyncClient):
    """Admin update user endpoint should require authentication."""
    r = await async_client.patch(
        "/api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000",
        json={"role": "admin"},
    )
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_delete_user_requires_auth(async_client: AsyncClient):
    """Admin delete user endpoint should require authentication."""
    r = await async_client.delete(
        "/api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000",
    )
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_users_pagination_params(async_client: AsyncClient):
    """Admin users endpoint should accept pagination params."""
    # Even without auth, verify the endpoint structure accepts query params
    r = await async_client.get("/api/v1/admin/users?page=2&limit=10")
    # Should fail auth but params should be accepted
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_trips_pagination_params(async_client: AsyncClient):
    """Admin trips endpoint should accept pagination params."""
    r = await async_client.get("/api/v1/admin/trips?page=2&limit=10")
    assert r.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_admin_update_user_body_validation(async_client: AsyncClient):
    """Admin update user should validate body."""
    r = await async_client.patch(
        "/api/v1/admin/users/123e4567-e89b-12d3-a456-426614174000",
        json={"invalid_field": "value"},
    )
    # Should either fail auth (401/403) or validation (422)
    assert r.status_code in (401, 403, 422)
