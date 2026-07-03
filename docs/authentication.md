# Authentication System

PlayGrid implements a hybrid authentication approach utilizing **Firebase Authentication** as the Identity Provider (IdP) and our local PostgreSQL database for rich profile data.

## Flow Overview

1. **Client Registration/Login**: The frontend application authenticates the user directly against Firebase Auth (via Google OAuth or Email/Password).
2. **Token Generation**: Firebase returns a secure JWT to the client.
3. **Database Synchronization (`/api/auth/sync`)**: The frontend immediately calls our backend sync endpoint with the Firebase token.
4. **Backend Verification**: The backend verifies the token using the `firebase-admin` SDK.
5. **Upsert Operation**: The backend checks if the user exists in PostgreSQL by their `firebaseId`. If they do not exist, a new user row is created. The internal `userId` is then returned to the frontend.

## Authorization

Once authenticated, the frontend attaches the Firebase JWT to all API requests inside the `Authorization: Bearer <token>` header.

The backend middleware (`requireAuth`) intercepts this request:
1. Validates the JWT cryptographically.
2. Looks up the user in PostgreSQL.
3. Attaches the PostgreSQL user object to `req.user`.

This ensures that our internal services always interact with our local PostgreSQL user IDs rather than raw Firebase UIDs.

## Security Controls

- **Rate Limiting**: The `/sync` endpoint is protected by a strict rate limiter to prevent bot sign-up spam.
- **Token Expiry**: Firebase manages token rotation automatically. Our backend will reject expired tokens immediately.
