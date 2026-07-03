# Real-time System (Socket.IO)

PlayGrid feels alive thanks to a highly optimized WebSocket layer running concurrently with our Express HTTP server. 

We utilize **Socket.IO** to manage bidirectional, real-time communication between the client and server.

## Connection Architecture

1. When a user logs in, the frontend establishes a Socket.IO connection.
2. The user is immediately placed into a personal room labeled `user:<userId>`.
3. The user also automatically joins rooms for all communities they are a member of, labeled `community:<communityId>`.

## Multi-Tab Presence

To provide accurate online presence indicators, the socket layer actively manages multi-tab scenarios. When a socket disconnects, the server uses `io.in(room).fetchSockets()` to verify if the user has other active connections before marking them as offline.

## Core Event Flows

- **Direct Messaging**: Sent via REST, but immediately dispatched by the server to the recipient's `user:<userId>` room for real-time UI updates.
- **Community Chat**: Sent to `community:<communityId>` rooms, broadcasting to all active members instantly.
- **Notifications**: System alerts (Friend Requests, Match Invites) are dispatched to the specific user's personal room.
- **Activity Feed**: When a user creates a match or joins a community, real-time feed updates are pushed to the rooms of all their active friends.

## Security

Socket connections rely on the same authentication guarantees as our REST API. Sockets missing valid authentication metadata are rejected at connection time. Additionally, server-side guards prevent users from manually joining private community rooms they do not belong to.
