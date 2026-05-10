# Backend

Contains the server-side code and Odoo integration modules.

Quick start:
- Install dependencies
- Configure connection to the Odoo instance
- Run the server from the `Backend` folder

## Local dev

1. `cp .env.example .env` (fill values)
2. `docker-compose up -d db redis`
3. `python -m venv .venv && source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `alembic upgrade head`
6. `uvicorn app.main:app --reload --port 8000`
