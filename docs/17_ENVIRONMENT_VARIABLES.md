# 17. Environment Variables

## Backend Configurations (`backend/.env`)

```ini
PORT=5001
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@localhost:5432/playgrid?schema=public"
FRONTEND_URL="http://localhost:5173"
FIREBASE_PROJECT_ID="playgrid-firebase-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@playgrid.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...-----END PRIVATE KEY-----\n"
CLOUDINARY_CLOUD_NAME="cloudinary-name"
CLOUDINARY_API_KEY="api-key"
CLOUDINARY_API_SECRET="api-secret"
GEMINI_API_KEY="AIzaSy..."
```

## Frontend Configurations (`frontend/.env`)

```ini
VITE_API_URL="http://localhost:5001/api"
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="playgrid.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="playgrid"
VITE_FIREBASE_STORAGE_BUCKET="playgrid.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="12345678"
VITE_FIREBASE_APP_ID="1:12345:web:abcd"
VITE_MAPBOX_TOKEN="pk.eyJ1..."
```

---

*This document is part of PlayGrid V1 Technical Manual.*
