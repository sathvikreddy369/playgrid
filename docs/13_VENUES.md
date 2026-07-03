# 13. Venues

## Purpose
Venues represent physical sports facilities, pitches, or courts. They act as rich location entities that power match creation, match discovery, navigation, and location intelligence.

## Features & Workflows
- **Rich Profiles**: Venues include comprehensive details such as descriptions, operating hours, amenities, sports supported, contact information (email, phone, website), pricing, and photo galleries.
- **Match Integration**: Matches are linked to specific venues (`venueId`). When viewing a match, the venue preview is shown, allowing users to quickly see where the game is happening and get directions.
- **Location Intelligence**: Venues support coordinate-based searching (latitude/longitude). Users can discover venues using "Nearby" sorting, which calculates the distance via the Haversine formula and sorts results by proximity.
- **Google Maps Integration**: "Get Directions" buttons link directly to Google Maps using the venue's coordinates. Mapbox is used for interactive maps on venue profiles.
- **Registration**: Venue owners (Organizers) can list their venues. Newly created venues are initially set to `PENDING` until an admin verifies them.
- **Review System**: Only players who have `ATTENDED` a match at a specific venue can write reviews and rate it. 
- **AI Summaries**: Adding a review triggers an async job that sends recent comments to Gemini to build a consensus summary of the venue's quality, which is cached in the database.

---

*This document is part of PlayGrid V1 Technical Manual.*
