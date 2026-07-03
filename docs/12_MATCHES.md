# 12. Matches

## Core Matches Model
Matches represent scheduled games. They have a maximum player count, cost parameters, and a physical location. A match can optionally be linked to a registered `Venue` via `venueId`, which provides users with rich location details, directions via Google Maps, and venue photos directly on the match page.

## Flow: Join Requests and Roster Moderation
1. **Request**: User requests to join. A `MatchPlayer` record is created as `PENDING`.
2. **Approval**: The match host approves/rejects the request.
3. **Capacity Check**: If the approved player count reaches `maxPlayers`, the match status shifts to `FULL`.
4. **Attendance**: After the match date passes, the host confirms player attendance (`ATTENDED`) and submits a performance rating (1-5 stars).
5. **Reputation & Badges**: Attending a match boosts user reputation points. Attending a certain number of matches triggers achievements (e.g. `MATCH_5`, `MATCH_10`).

---

*This document is part of PlayGrid V1 Technical Manual.*
