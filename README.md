# Affiliate Tracking & Management Platform

This is a complete, lightweight V1 implementation of an Affiliate Tracking platform built with FastAPI and Next.js.

## Features Built
- Full User RBAC hierarchy (Admin -> Manager -> Affiliate)
- Authentication (JWT + Argon2)
- Fast public tracking endpoint (`/c/{code}`)
- Unique click generation and Customer Sub-ID tracking (`?sub_id=...`)
- Offer Assignment management
- Real-time role-specific dashboards
- Built with SQLite by default for easy local execution (Production can swap to PostgreSQL easily).

## Local Running

To run this project locally, simply follow these commands:

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment and install dependencies:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate   # Windows
   # source venv/bin/activate # Mac/Linux
   pip install -r requirements.txt
   ```
3. Run the migrations to set up the SQLite database:
   ```bash
   alembic upgrade head
   ```
4. Seed the database with the initial test accounts:
   ```bash
   python -m app.seed
   ```
5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

*API Documentation will be available at: http://127.0.0.1:8000/docs*

### Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Next.js dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```

*The application will be available at: http://localhost:3000*

## Test Accounts

The following test accounts are generated when you run the seed script. They all share the password `password123`.

- **Admin**: `admin@example.com`
- **Manager**: `manager@example.com`
- **Affiliate**: `affiliate@example.com`