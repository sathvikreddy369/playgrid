# 08. Socket.IO Implementation

## Overview
Socket.IO enables real-time messaging, typing indicators, read receipts, and live notifications.

## Connection Authentication
- Verification happens during handshake using client-sent Firebase ID tokens.
- Extracted Firebase UID checks the SQL Database. If user is blocked or not found, connection is rejected.
- On success, the connection joins a personalized room: `user:${userId}`.

## Event List

### Client to Server
- `send_message`: Payload `{ to: string, content: string }`. Saves message to DB and routes it.
- `typing` / `stop_typing`: Payload `{ to: string }`. Emits indicators.
- `mark_read`: Payload `{ from: string }`. Updates matching messages to `isRead: true`.

### Server to Client
- `receive_message`: Emits complete `Message` object.
- `typing` / `stop_typing`: Relays typing state `{ from: string }`.
- `messages_read`: Relays read status changes `{ by: string }`.
- `new_notification`: Sends real-time `Notification` events immediately.

---

*This document is part of PlayGrid V1 Technical Manual.*
