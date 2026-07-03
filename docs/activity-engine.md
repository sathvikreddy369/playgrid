# Activity Engine

The Activity Engine is the core mechanism that makes PlayGrid feel like a social platform rather than just a utility. It transforms user actions into an engaging, infinite-scrolling social feed.

## Architecture

The Activity Engine is entirely decentralized. When significant events occur in isolated services (e.g., a match is created in the `MatchService`, or a user joins a community in the `CommunityService`), the system generates an immutable `Post` record in the database.

These generated posts capture the context of the event and are instantly broadcast to the user's social graph via Socket.IO.

## Feed Types

The system supports two distinct feeds:
1. **Global Feed**: Displays high-level public activity across the entire platform.
2. **Friends Feed**: Displays a curated list of activities performed exclusively by the user's established connections.

## Interactions

Users can interact with the Activity Engine directly by:
- Creating manual text/media posts.
- Commenting on system-generated activity.
- Utilizing the real-time websocket connections to see updates without refreshing the page.
