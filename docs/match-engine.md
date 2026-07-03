# Match Engine

The Match Engine facilitates the discovery, RSVP, and lifecycle management of real-world sporting events on PlayGrid.

## Match Lifecycle

1. **Creation**: Any user can host a match. They select the sport, define a maximum player count, specify skill requirements, set a date, and tie the event to a specific Venue.
2. **Discovery**: Matches appear on the global Match Board or map, filtered by distance, sport, and skill level.
3. **RSVP Flow**: Users request to join a match. The creator acts as the administrator and can Approve or Reject these requests based on the user's profile and reputation.
4. **Active State**: Approved users can chat within a dedicated Match lobby to coordinate logistics.
5. **Resolution**: Once the scheduled time passes, the match transitions to a past state, prompting participants to leave peer reviews.

## Roles

The Match Engine strictly enforces role-based access control (RBAC):
- **Creator**: Has full administrative control over the match. Can edit details, cancel the event, and manage attendees.
- **Participant**: Approved users who can view the internal lobby and chat.
- **Pending**: Users who have requested to join but are awaiting creator approval.
- **Guest**: Non-participants who can view public match metadata but cannot interact.
