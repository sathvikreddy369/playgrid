# Playgrid Tech Stack & Architecture

## Frontend
- **React (v19)** with **Vite**
- **TypeScript**
- **Tailwind CSS (v4)**: For rapid, mobile-first, utility-first styling.
- **Mapbox GL**: For displaying maps and location selection.
- **React Testing Library & Vitest**: For UI testing.

## Backend
- **Node.js** & **Express**
- **TypeScript**
- **Prisma**: Type-safe database ORM.
- **Socket.io**: Real-time websocket server for messaging.
- **node-cron**: Scheduled jobs (e.g., locking matches at start time).
- **Jest & Supertest**: Backend API testing.

## Database & Storage
- **PostgreSQL**: Primary relational database.
- **Supabase Auth**: Authentication and user management.
- **Cloudinary**: Storing uploaded images (profiles, venue photos).

## Infrastructure (Local)
- **Docker & Docker Compose**: For spinning up local PostgreSQL instantly.
