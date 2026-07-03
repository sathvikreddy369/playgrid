# Troubleshooting Guide

Common issues encountered when developing PlayGrid locally and their solutions.

## Database Issues

### "Authentication failed against database server"
- **Cause**: Your PostgreSQL credentials in `backend/.env` are incorrect.
- **Solution**: Verify `DATABASE_URL` matches your local postgres user and password.

### "Prisma Client cannot be found"
- **Cause**: The Prisma client was not generated after a schema change or initial clone.
- **Solution**: Run `npx prisma generate` inside the `backend` folder.

## Authentication Issues

### "Firebase ID token has invalid signature"
- **Cause**: You are using a frontend Firebase project that does not match the backend's Firebase Admin credentials.
- **Solution**: Ensure your `VITE_FIREBASE_*` keys match the `FIREBASE_PROJECT_ID` and `FIREBASE_PRIVATE_KEY` on the backend.

## Frontend Issues

### Mapbox GL is not rendering maps
- **Cause**: Missing or invalid Mapbox token.
- **Solution**: Ensure `VITE_MAPBOX_TOKEN` is set in `frontend/.env`.

### UI feels "broken" or styles are missing
- **Cause**: Tailwind CSS is not rebuilding.
- **Solution**: Restart the Vite dev server (`npm run dev`).

## Real-time Issues

### Sockets disconnecting immediately
- **Cause**: CORS errors or unauthenticated socket attempts.
- **Solution**: Check the backend terminal logs. Sockets require a valid Firebase JWT to connect. Ensure your frontend is passing the token during socket initialization.
