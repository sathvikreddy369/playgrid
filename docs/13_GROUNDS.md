# 13. Grounds (Venues)

## Purpose
Grounds represent sports venues, pitches, or courts that players can review, filter by geolocation, or map to scheduled matches.

## Workflows
- **Registration**: Venue owners list their grounds with location coordinates, pricing, photos, and contact information. Newly created grounds are set to `PENDING`.
- **Admin Verification**: Admins review and transition status to `VERIFIED` or `REJECTED`.
- **Review Loop**: Players write comments and rate grounds on a scale of 1-5.
- **AI Summary**: Adding a review triggers an async job that sends recent comments to Gemini to build a consensus summary, which is cached in the database.

---

*This document is part of PlayGrid V1 Technical Manual.*
