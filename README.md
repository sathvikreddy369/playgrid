# Playgrid - Modern Sports Social Network

Playgrid is a modern sports social network designed to help people discover local sports activities, join communities, find teammates, and organize matches.

## 🚀 Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Socket.IO Client, Mapbox GL JS.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Socket.IO, Cloudinary.
- **Database:** PostgreSQL (Supabase or Local via Docker).
- **Authentication:** Firebase Auth.

## 🛠 Project Structure

- `/frontend` - The React Vite application.
- `/backend` - The Node.js Express API.
- `docker-compose.yml` - For local PostgreSQL database.

## 🏃‍♂️ Getting Started (Local Development)

### Prerequisites

- Node.js (v18+)
- Docker (optional, for local DB)
- Firebase Project
- Cloudinary Account
- Mapbox Account

### 1. Database Setup
```bash
# Start the local PostgreSQL database
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy env example and fill in credentials
cp .env.example .env

# Generate Prisma client and migrate database
npx prisma generate
npx prisma migrate dev --name init

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy env example and fill in credentials
cp .env.example .env

# Start development server
npm run dev
```

## 🏗 Architecture Principles
- **Clean Architecture:** The backend follows a strict layered architecture (Routes -> Controllers -> Services -> Repositories).
- **Single Source of Truth:** Database schemas are managed entirely through Prisma.
- **Strict Typing:** End-to-end type safety with TypeScript and Zod validation.
