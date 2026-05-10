"""Admin service for analytics and user management."""

import datetime as dt
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.trip import Trip
from app.models.city import City
from app.models.section_activity import SectionActivity
from app.models.section import Section


async def get_stats(db: AsyncSession) -> dict:
    """Get overall system stats."""
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar_one()

    trips_result = await db.execute(select(func.count(Trip.id)))
    total_trips = trips_result.scalar_one()

    cities_result = await db.execute(select(func.count(City.id)))
    total_cities = cities_result.scalar_one()

    activities_result = await db.execute(select(func.count(SectionActivity.id)))
    total_activities = activities_result.scalar_one()

    return {
        "totalUsers": total_users,
        "totalTrips": total_trips,
        "totalCities": total_cities,
        "totalActivities": total_activities,
    }


async def list_users(
    db: AsyncSession,
    page: int,
    limit: int,
) -> tuple[List[User], int, int]:
    """List all users with pagination."""
    query = select(User).order_by(User.created_at.desc() if hasattr(User, 'created_at') else User.email)

    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar_one()

    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    users = result.scalars().all()

    total_pages = -(-total // limit)
    return users, total, total_pages


async def get_user(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get a user by ID."""
    return await db.get(User, UUID(user_id))


async def update_user(
    db: AsyncSession,
    user_id: str,
    **updates: Optional[str],
) -> Optional[User]:
    """Update a user."""
    user = await db.get(User, UUID(user_id))
    if not user:
        return None

    for key, value in updates.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: str) -> bool:
    """Delete a user."""
    user = await db.get(User, UUID(user_id))
    if not user:
        return False

    await db.delete(user)
    await db.commit()
    return True


async def list_trips(
    db: AsyncSession,
    page: int,
    limit: int,
) -> tuple[List[Trip], int, int]:
    """List all trips with pagination."""
    query = select(Trip).order_by(Trip.start_date.desc() if hasattr(Trip, 'start_date') else Trip.title)

    count_result = await db.execute(select(func.count()).select_from(Trip))
    total = count_result.scalar_one()

    offset = (page - 1) * limit
    result = await db.execute(query.offset(offset).limit(limit))
    trips = result.scalars().all()

    total_pages = -(-total // limit)
    return trips, total, total_pages


async def get_analytics(db: AsyncSession) -> dict:
    """Get analytics data."""
    # Top cities by trip count
    top_cities_query = (
        select(
            City.id.label("city_id"),
            City.name.label("city_name"),
            City.country.label("city_country"),
            func.count(Trip.id).label("trip_count"),
        )
        .join(Trip, Trip.city_id == City.id, isouter=True)
        .group_by(City.id)
        .order_by(func.count(Trip.id).desc())
        .limit(10)
    )
    top_cities_result = await db.execute(top_cities_query)
    top_cities = [
        {
            "city_id": str(row.city_id),
            "city_name": row.city_name,
            "city_country": row.city_country,
            "trip_count": row.trip_count,
        }
        for row in top_cities_result
    ]

    # Top activities by activity count (grouped by title)
    top_activities_query = (
        select(
            SectionActivity.title.label("activity_title"),
            func.count(SectionActivity.id).label("activity_count"),
        )
        .group_by(SectionActivity.title)
        .order_by(func.count(SectionActivity.id).desc())
        .limit(10)
    )
    top_activities_result = await db.execute(top_activities_query)
    top_activities = [
        {
            "activity_title": row.activity_title,
            "activity_count": row.activity_count,
        }
        for row in top_activities_result
    ]

    # User trends for last 30 days
    thirty_days_ago = dt.datetime.utcnow() - dt.timedelta(days=30)
    # Since User may not have created_at, we'll use a placeholder
    # In production, you'd want to add created_at to the User model
    user_trends = []
    for i in range(30):
        date_obj = dt.datetime.utcnow() - dt.timedelta(days=i)
        date_str = date_obj.strftime("%Y-%m-%d")
        # Placeholder - in real implementation, query actual user creation dates
        user_trends.append({
            "date": date_str,
            "count": 0,
        })
    user_trends.reverse()

    # Trip trends for last 30 days
    trip_trends = []
    for i in range(30):
        date_obj = dt.datetime.utcnow() - dt.timedelta(days=i)
        date_str = date_obj.strftime("%Y-%m-%d")
        trip_trends.append({
            "date": date_str,
            "count": 0,
        })
    trip_trends.reverse()

    return {
        "topCities": top_cities,
        "topActivities": top_activities,
        "userTrends": user_trends,
        "tripTrends": trip_trends,
    }
