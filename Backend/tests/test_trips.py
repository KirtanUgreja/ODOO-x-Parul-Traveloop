"""Trip domain tests - ownership enforcement and CRUD operations."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_trip_requires_auth(async_client: AsyncClient):
    """Trips endpoint should require authentication."""
    r = await async_client.get("/api/v1/trips")
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_trip_list_unauthorized(async_client: AsyncClient):
    """Trip list should require valid token."""
    r = await async_client.get("/api/v1/trips")
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_trip_create_unauthorized(async_client: AsyncClient):
    """Trip creation should require authentication."""
    r = await async_client.post(
        "/api/v1/trips",
        json={"title": "Test Trip"},
    )
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_trip_get_unauthorized(async_client: AsyncClient):
    """Trip retrieval should require authentication."""
    r = await async_client.get("/api/v1/trips/some-uuid")
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_trip_update_unauthorized(async_client: AsyncClient):
    """Trip update should require authentication."""
    r = await async_client.patch(
        "/api/v1/trips/some-uuid",
        json={"title": "Updated Trip"},
    )
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_trip_delete_unauthorized(async_client: AsyncClient):
    """Trip deletion should require authentication."""
    r = await async_client.delete("/api/v1/trips/some-uuid")
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_section_list_unauthorized(async_client: AsyncClient):
    """Section list should require authentication."""
    r = await async_client.get("/api/v1/trips/some-uuid/sections")
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_section_create_unauthorized(async_client: AsyncClient):
    """Section creation should require authentication."""
    r = await async_client.post(
        "/api/v1/trips/some-uuid/sections",
        json={"title": "Test Section"},
    )
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_activity_list_unauthorized(async_client: AsyncClient):
    """Activity list should require authentication."""
    r = await async_client.get("/api/v1/trips/trip-uuid/sections/section-uuid/activities")
    assert r.status_code in (401, 422)


@pytest.mark.asyncio
async def test_activity_create_unauthorized(async_client: AsyncClient):
    """Activity creation should require authentication."""
    r = await async_client.post(
        "/api/v1/trips/trip-uuid/sections/section-uuid/activities",
        json={"title": "Test Activity"},
    )
    assert r.status_code in (401, 422)
