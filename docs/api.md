# API Architecture

PlayGrid utilizes a strict RESTful API philosophy designed for scalability and clear resource separation.

## Endpoint Structure

The backend exposes logical resources under the `/api/` prefix.

Examples:
- `/api/auth/*` - Session synchronization and profile establishment.
- `/api/users/*` - Profiles, settings, and connection management.
- `/api/matches/*` - Match creation, RSVP flow, and details.
- `/api/communities/*` - Community browsing, joining, and management.
- `/api/venues/*` - Venue creation and verification.
- `/api/posts/*` - Activity feed interaction.
- `/api/messages/*` - Chat history retrieval.

## Response Standardization

All successful responses return JSON payload blocks. 
Errors are strictly standardized. Every error response conforms to the following schema regardless of the endpoint:

```json
{
  "error": "Message describing the failure",
  "errorId": "uuid-for-tracking",
  "status": 400 
}
```

## Security

Most endpoints require authentication. The frontend attaches a Firebase JWT token as a Bearer token in the `Authorization` header. The backend `requireAuth` middleware verifies this token and injects `req.user` into the pipeline.
