# Deployment Guide

PlayGrid is built to be deployed on modern cloud infrastructure. The recommended stack is **Vercel** for the Frontend and **Render** (or Heroku/AWS) for the Backend.

## Prerequisites
- A PostgreSQL database (e.g., Supabase, Neon, AWS RDS).
- A Firebase project.
- A Cloudinary account.
- A Google Gemini API key.

## 1. Backend Deployment (Render)

1. Create a new "Web Service" on Render.com.
2. Connect your GitHub repository and point the root directory to `backend`.
3. Set the Build Command:
   ```bash
   npm install && npx prisma generate && npx prisma db push && npm run build
   ```
4. Set the Start Command:
   ```bash
   npm run start
   ```
5. Add the Environment Variables:
   - `DATABASE_URL` (Your production PostgreSQL connection string)
   - `FRONTEND_URL` (The URL where Vercel will host your app)
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `CLOUDINARY_*` keys
   - `GEMINI_API_KEY`

## 2. Frontend Deployment (Vercel)

1. Create a new project on Vercel.
2. Connect your GitHub repository and point the root directory to `frontend`.
3. Vercel should auto-detect Vite. Ensure the build command is `npm run build`.
4. Add the Environment Variables:
   - `VITE_API_URL` (The URL provided by Render for your backend, e.g., `https://playgrid-api.onrender.com/api`)
   - `VITE_MAPBOX_TOKEN`
   - `VITE_FIREBASE_*` keys
5. Deploy.

## 3. Post-Deployment Verification

1. **Database Check**: Ensure the Render build logs show `npx prisma db push` executed successfully, indicating the schema was applied to your production DB.
2. **Health Check**: Visit `https://your-backend-url.onrender.com/health` to verify the API and DB connection are healthy.
3. **CORS**: Ensure your backend `.env` `FRONTEND_URL` exactly matches your Vercel domain to prevent Cross-Origin Resource Sharing errors.
