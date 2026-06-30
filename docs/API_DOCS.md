# API & WebSockets Reference

PlayGrid uses a RESTful JSON API for standard data operations and Socket.IO for real-time messaging.

## Base URL
Local Development: `http://localhost:5001/api`

## Authentication
All protected routes require a Bearer token issued by Firebase Authentication.
**Header:** `Authorization: Bearer <firebase_id_token>`

## Core REST Endpoints

### Matches (`/matches`)
- `GET /matches` - Fetch a paginated list of local matches.
  - Query Params: `page`, `limit`, `status`, `sport`
- `GET /matches/:id` - Fetch details for a specific match, including roster.
- `POST /matches` - Create a new match. (Requires auth)
- `POST /matches/:id/join` - Request to join a match.
- `PUT /matches/:id/action` - Approve/reject a player, or mark attendance. (Creator only)

### Grounds (`/grounds`)
- `GET /grounds` - Fetch verified sports grounds.
- `GET /grounds/:id` - Fetch ground details and user reviews.
- `POST /grounds` - Submit a new ground for admin verification.
- `POST /grounds/:id/review` - Post a review (1-5 rating) for a ground.

### Communities (`/communities`)
- `GET /communities` - Fetch verified communities.
- `POST /communities` - Register a new community.
- `POST /communities/:id/join` - Join a community.

### Admin (`/admin`)
*(Requires `ADMIN` role token)*
- `GET /admin/stats` - Platform-wide analytics.
- `GET /admin/queue` - Pending Grounds and Communities awaiting verification.
- `GET /admin/users` - Paginated user management list.
- `PUT /admin/reports/:id/resolve` - Action on user-submitted moderation reports.

## Socket.IO Events

The real-time messaging system connects to `http://localhost:5001`.

### Connecting
```javascript
const socket = io('http://localhost:5001', {
  auth: { token: "user_firebase_token" }
});
```

### Client -> Server Events
- `join_room(roomId)`: Joins a specific chat room.
- `leave_room(roomId)`: Leaves the room.
- `send_message(payload)`: Sends a message to a room.
  - Payload: `{ roomId, receiverId, content }`

### Server -> Client Events
- `receive_message`: Emitted when a new message arrives in your active room.
- `notification`: Emitted for system alerts (e.g., "Your match request was approved!").

## Error Handling
The API returns structured JSON errors alongside appropriate HTTP status codes:
```json
{
  "error": "Validation failed",
  "errorId": "err_f8a93j",
  "details": ["Email is required"]
}
```
*Note: Use the `errorId` when contacting support for tracing in backend logs.*
