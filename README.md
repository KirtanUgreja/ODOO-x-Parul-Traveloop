# 🌍 Traveloop - AI-Powered Travel Planner

Traveloop is a premium travel planning platform that leverages AI to create personalized, day-by-day itineraries based on your destination, budget, and interests.

## 🚀 Key Features

- **AI Itinerary Generation**: Create perfect travel plans in seconds using OpenAI.
- **Smart Budgeting**: Track spending and visualize category breakdowns.
- **Interactive Timelines**: Manage activities with a beautiful, mobile-optimized interface.
- **Packing Checklists**: Stay organized with smart packing suggestions and swipe-to-delete management.
- **Mobile First**: Optimized for a seamless experience on any device.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend**: Node.js, Express, Prisma (PostgreSQL), JWT, OpenAI API.

---

## 💻 Local Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database
- OpenAI API Key

### 2. Clone and Install
```bash
git clone <repository-url>
cd traveloop

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/traveloop"
JWT_SECRET="your_jwt_secret"
OPENAI_API_KEY="your_openai_key"
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
PORT=5000
NODE_ENV=development
```

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_id
```

### 4. Database Setup & Seeding
```bash
cd backend

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed the database with demo data
npm run seed
```

### 5. Run the Application
```bash
# Start Backend (from /backend)
npm run dev

# Start Frontend (from /frontend)
npm run dev
```

---

## 📊 API Documentation

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user profile (Protected)

### Trips
- `GET /api/trips` - Get all trips for current user
- `POST /api/trips` - Create a new trip
- `GET /api/trips/:id` - Get detailed trip info
- `PATCH /api/trips/:id` - Update trip details
- `DELETE /api/trips/:id` - Delete a trip

### Activities & AI
- `POST /api/ai/generate` - Generate AI itinerary
- `POST /api/activities` - Add activity to a trip
- `DELETE /api/activities/:id` - Remove an activity

---

## 🧪 Testing Checklist

A full testing checklist is available in `test.md`.

### Demo Account
- **Email**: `demo@traveloop.com`
- **Password**: `password`
