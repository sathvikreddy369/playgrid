# Playgrid

Playgrid is a comprehensive platform for organizing and joining online e-sports and offline sports matches. It supports core users (who can post and join matches) and ground owners (who can host paid matches and showcase venues).

## Features
- **Mobile First Design**: Built with Tailwind CSS and Framer Motion for a premium user experience.
- **Location Based**: Mapbox integration for picking and viewing exact match locations.
- **Match Management**: Host matches, accept/reject join requests, and track player attendance.
- **Real-Time Ready**: Architecture planned with Socket.io for live messaging.

## Tech Stack
- **Frontend**: React + Vite + TypeScript, Tailwind CSS, Framer Motion, Mapbox GL
- **Backend**: Node.js, Express, TypeScript, Prisma, node-cron
- **Database**: PostgreSQL (Docker / Supabase)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker (for local PostgreSQL database)
- Supabase Account
- Cloudinary Account
- Mapbox Account

### Setup Instructions

1. **Clone and Install Dependencies**
   Navigate into both `frontend` and `backend` directories and run:
   ```bash
   npm install
   ```

2. **Environment Variables**
   - **Frontend**: Create a `.env` in the `/frontend` folder:
     ```env
     VITE_SUPABASE_URL=your-supabase-url
     VITE_SUPABASE_ANON_KEY=your-supabase-key
     VITE_MAPBOX_TOKEN=your-mapbox-token
     VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
     VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
     ```
   - **Backend**: Create a `.env` in the `/backend` folder:
     ```env
     DATABASE_URL="postgresql://postgres:password@localhost:5432/playgrid?schema=public"
     PORT=5000
     ```

3. **Database Setup**
   Ensure Docker is running, then in the project root:
   ```bash
   docker-compose up -d
   ```
   Navigate to `/backend` and push the Prisma schema:
   ```bash
   npx prisma db push
   ```

4. **Run the App**
   - **Frontend**: `cd frontend && npm run dev`
   - **Backend**: `cd backend && npm run dev` (Ensure a dev script exists in your package.json using ts-node)

## Testing
To run frontend tests using Vitest:
```bash
cd frontend
npm run test
```
