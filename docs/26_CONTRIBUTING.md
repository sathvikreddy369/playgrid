# 26. Contributing Guide

## Development Environment Setup

### 1. Requirements
- Node.js (v18+)
- PostgreSQL database instance
- Docker (optional, docker-compose.yml runs PostgreSQL locally)

### 2. Startup Steps
1. Spin up the local database: `docker compose up -d`.
2. Configure `.env` files in `backend/` and `frontend/` folders.
3. Install dependencies: `npm install` in both backend and frontend directories.
4. Run migrations and seed data:
   ```bash
   cd backend
   npx prisma migrate dev
   npm run seed:demo
   ```
5. Launch development services: `npm run dev` in both backend and frontend.

### 3. Pull Request Standards
- Run `npm test` on backend and frontend to verify no regressions exist.
- Run `npm run lint` on the frontend workspace.
- Avoid introducing any runtime or compiler warnings.

---

*This document is part of PlayGrid V1 Technical Manual.*
