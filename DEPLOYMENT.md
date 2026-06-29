# PlayGrid Deployment Guide

This guide will walk you through deploying PlayGrid to a production environment using modern, free-tier friendly cloud services.

## Architecture
- **Frontend**: Vercel
- **Backend (Node/Express/Socket.io)**: Render
- **Database (PostgreSQL)**: Supabase
- **Authentication**: Firebase
- **Images**: Cloudinary

---

## Step 1: Set up Supabase (Database)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Once created, go to Project Settings -> Database.
3. Copy the **Transaction pooler string** (for standard connections) and **Session string** (for Prisma migrations).
4. Save these to use as `DATABASE_URL` (Pooler) and `DIRECT_URL` (Session) in your backend `.env`.

---

## Step 2: Set up Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Create a new project.
3. Enable **Authentication** (Email/Password).
4. **For Frontend**: Go to Project Overview -> Add Web App. Copy the `firebaseConfig` variables into `frontend/.env`.
5. **For Backend**: Go to Project Settings -> Service Accounts -> Generate New Private Key. Open the downloaded JSON file and copy the `project_id`, `private_key`, and `client_email` into `backend/.env`.

---

## Step 3: Set up Cloudinary
1. Create a free account at [Cloudinary](https://cloudinary.com).
2. Go to your Dashboard and copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Add these to your `backend/.env`.

---

## Step 4: Set up Google Gemini (AI)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Generate an API Key.
3. Add this to your `backend/.env` as `GEMINI_API_KEY`.

---

## Step 5: Deploy the Backend (Render)
Render is used because it has excellent native support for WebSockets (Socket.IO).

1. Push your repository to GitHub.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file located in `backend/render.yaml` if you set the Root Directory to `backend`. 
   - *Alternative*: If it doesn't use the YAML, manually configure it:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npx prisma generate && npm run build`
     - **Start Command**: `npm start`
5. Click **Advanced** and add all the environment variables from your `backend/.env` file.
6. Deploy! Copy the generated Render URL (e.g., `https://playgrid-api.onrender.com`).

**Database Migration**: Note that the first time you deploy, you need to sync your Prisma schema to Supabase. You can do this locally by temporarily pointing your local `.env` to Supabase and running `npx prisma db push`, or by configuring a custom Render build script that runs `npx prisma migrate deploy`.

---

## Step 6: Deploy the Frontend (Vercel)
Vercel is optimized for Vite/React applications.

1. Go to [Vercel](https://vercel.com) and add a new project.
2. Connect your GitHub repository.
3. Set the **Framework Preset** to Vite.
4. Set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add all variables from `frontend/.env`.
   - **Crucially**: Set `VITE_API_URL` to your new Render URL (e.g., `https://playgrid-api.onrender.com/api`).
6. Deploy! Vercel will automatically read the `vercel.json` file for client-side routing.

---

## Step 7: Final Verification
1. Visit your Vercel URL.
2. Register a new account.
3. Test Real-time messaging (requires the backend sockets to be working).
4. Try creating a post with AI filtering.

**Congratulations! PlayGrid is live.**
