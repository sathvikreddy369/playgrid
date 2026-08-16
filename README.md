# ⚽ PlayGrid — Sports Community & Match-Organizing Platform

PlayGrid is a full-stack, mobile-first sports community platform that enables players to discover local sports matches, organize games, manage join requests, communicate via realtime chat, mark player attendance, and leave post-match reviews.

Designed and optimized for small-scale production deployments on **Vercel (Frontend)** and **Render (Backend)** with **Supabase PostgreSQL**.

---

## 🏗️ Tech Stack & Architecture

```text
Vercel (Frontend)           Render (Backend)             Database & Auth
┌───────────────────┐       ┌────────────────────┐       ┌─────────────────┐
│  React 19 + Vite  │ ────► │  Express + TS Node │ ────► │ Supabase Auth   │
│  TypeScript       │ HTTP  │  Prisma ORM        │       │ PostgreSQL DB   │
│  Tailwind CSS     │ WS    │  Socket.IO Server  │       │ Cloudinary      │
└───────────────────┘       └────────────────────┘       └─────────────────┘
```

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Mapbox GL.
* **Backend:** Node.js, Express, TypeScript, Prisma ORM, Socket.IO.
* **Database & Auth:** PostgreSQL (Supabase), Supabase Auth.
* **Realtime:** Socket.IO with JWT handshake authentication & room channel authorization.
* **Deployment:** Vercel Free Tier (Frontend) + Render Free Tier (Backend).

---

## ✨ Core Features

1. **Match Discovery & Search:** Browse available matches filtered by sport, location, date, price, and tags. Mapbox integration for interactive location selection.
2. **Host Match Creation:** Realtime form submission with future-date Zod validation, location pinning, and pricing configuration.
3. **Atomic Slot Reservations:** Concurrency-safe request approvals using Prisma interactive transactions (`$transaction`), guaranteeing `filledSlots <= totalSlots`.
4. **Realtime Authenticated Chat:** WebSocket match rooms protected by JWT session authentication and match participant authorization.
5. **Post-Match Reviews & Attendance:** Rating and review submission for completed matches by accepted participants, with host attendance marking.
6. **In-App Notifications:** Realtime DB notifications on request approval, rejection, and match cancellations.

---

## 🛡️ Key Engineering & Security Decisions

* **Read-Only Default Auth:** Refactored auth middleware (`requireAuth`) to use read-only `findUnique` user lookups by default, eliminating database write-on-read overhead on every API call.
* **Safe User Provisioning:** Missing user provisioning uses atomic `create` wrapped with Prisma `P2002` unique constraint collision handling to prevent race conditions under concurrent first-time logins.
* **Socket Identity Enforcement:** Chat messages extract `senderId` directly from the authenticated socket session payload — client-side sender ID spoofing is strictly rejected.
* **Free-Tier Resilience:** Frontend API client (`api.ts`) includes automatic cold-start retry interceptors for Render free-tier instance spin-up delays.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL Database or Supabase Account
* Mapbox Token (`VITE_MAPBOX_TOKEN`)

### 1. Environment Setup

**Backend (`backend/.env`):**
```env
PORT=5001
DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
DIRECT_URL="postgresql://postgres:password@host:5432/postgres"
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_KEY="your-supabase-key"
CLOUDINARY_URL="cloudinary://key:secret@cloud_name"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL="http://localhost:5001/api"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-key"
VITE_MAPBOX_TOKEN="your-mapbox-token"
```

### 2. Database Migration & Seeding

```bash
cd backend
npm install
npx prisma db push
npm run seed
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

---

## 🧪 Testing & Build Verification

```bash
# Run Backend Integration & Security Tests
cd backend
npm test
npm run build

# Run Frontend Component Tests
cd frontend
npm test
npm run build
```

---

## 📄 License
ISC License — Free to use for learning and portfolio demonstrations.
