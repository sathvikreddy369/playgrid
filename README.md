# PlayGrid

PlayGrid is a comprehensive sports community platform that connects players, organizers, and venue owners. It features real-time messaging, AI-driven moderation and recommendations, interactive community feeds, and match scheduling.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, React Query
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Prisma (PostgreSQL)
- **Authentication**: Firebase Authentication
- **AI Integration**: Google Gemini API
- **Image Hosting**: Cloudinary

## Features
- **Authentication**: Firebase-backed secure login and registration.
- **Social Feed**: Post looking for players, team announcements, and general sports updates.
- **Communities**: Create and join sports communities based on interests.
- **Matches**: Schedule matches, manage RSVPs, and invite players.
- **Venues**: Register and verify sports grounds with AI-generated summaries.
- **Real-time Messaging**: Chat with other players instantly using Socket.IO.
- **Admin Dashboard**: Manage users, approve venues, and monitor platform health.
- **AI Moderation**: Automatically filter spam and inappropriate content using Gemini.

## Local Development

### 1. Database Setup
We use PostgreSQL. Create a local database named `playgrid`.

### 2. Environment Variables
Create `.env` files in both `/frontend` and `/backend` based on the `.env.example` files provided.

### 3. Start Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment
Please see `DEPLOYMENT.md` for step-by-step instructions on deploying the application to production using Vercel, Render, and Supabase.
