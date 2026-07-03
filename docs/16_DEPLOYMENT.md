# 16. Deployment

## Configurations

### Backend (Render / VPS)
- Configured via `render.yaml` specification.
- Runs `npm run build` (runs `tsc` compiler).
- Runs `npm start` (starts built node application using dotenv configurations).
- Health checks target `/health` route (returns `200` status if server and database are healthy).

### Frontend (Vercel)
- Configured via `vercel.json` specification.
- Rewrites all routing paths (`/*`) to `/index.html` to support client-side React SPA routing.
- Environment variables (e.g. Firebase credentials, backend URLs) are configured inside the hosting console.

---

*This document is part of PlayGrid V1 Technical Manual.*
