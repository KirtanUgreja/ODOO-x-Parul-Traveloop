from sqlalchemy import func, select


async def paginate(query, db, page: int, limit: int):
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar_one()
    items = (await db.execute(query.offset((page - 1) * limit).limit(limit))).scalars().all()
    total_pages = -(-total // limit)
    return items, total, total_pages
