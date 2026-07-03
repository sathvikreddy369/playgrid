# Community System

The Community System allows users to organize around local neighborhoods, specialized sports, or competitive leagues.

## Community Types

Communities on PlayGrid are strictly separated into two distinct privacy tiers:

1. **Public Communities**: 
   - Visible in search results.
   - Anyone can view the member list and public activity.
   - Joining is instantaneous.

2. **Private Communities**:
   - Hidden from unauthenticated or non-member users in some contexts.
   - Require explicit approval from a Community Admin to join.
   - Internal chat and member lists are strictly gated at the service layer.

## Real-time Integration

Every community acts as an isolated real-time silo. Upon joining, users are instantly subscribed to the community's Socket.io room, granting them access to the real-time community group chat and immediate push notifications for community announcements.
