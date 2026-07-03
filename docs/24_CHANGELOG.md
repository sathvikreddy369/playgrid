# 24. Changelog

## V1.0.0 (2026-07-03)

### Phase 4: Venue Engine Overhaul
1. **System-Wide Nomenclature Refactor**:
   - Renamed `Ground` to `Venue` across the entire database, backend, frontend, APIs, and models.
2. **Rich Venue Profiles**:
   - Expanded the Venue schema to include `description`, `operatingHours`, `contactEmail`, `website`, `pricing`, and `amenities`.
   - Updated frontend `VenueDetail.tsx` to display gallery, location mapping, upcoming matches, amenities, and contact info in a responsive UI.
3. **Match Integration**:
   - Added `venueId` to `Match` schema. 
   - Integrated a real-time Venue preview within `MatchDetail.tsx` featuring "Get Directions" linking directly to Google Maps coordinates.
4. **Location Intelligence**:
   - Implemented a "Nearby" discovery filter using the Haversine distance formula based on GPS coordinates.
   - Updated `Venues.tsx` to support both "Highest Rated" and "Nearby" sorting (with browser geolocation request).
5. **Seed System Overhaul**:
   - Overhauled `VenueFactory.ts` to populate the database with real Hyderabad venues and realistic GPS coordinates, replacing dummy generic names.

### Phase 3: Match Engine (Previous)
1. **Added Real-Time Socket Notifications**:
   - Connected the Express notification service with Socket.IO. On `createNotification`, the server triggers a live `new_notification` socket dispatch to the target user.
2. **Fixed Socket Test Foreign Key Violation**:
   - Resolved database constraint warning in `socket.test.ts`. Created a test receiver user in `beforeAll` and routed messages to them instead of a dummy name.
3. **Initialized Default Badges**:
   - Added badge initialization at server start (`index.ts`) and db seed (`runner.ts`) to pre-load system default achievements.
4. **Resolved Test act() Warning Logs**:
   - Mocked the AuthProvider and useAuth hook in `CreatePostForm.test.tsx` to prevent async firebase actions from generating state update warnings outside tests.
5. **Fixed Linter Warning**:
   - Removed the unused `Compass` import in `Home.tsx` to maintain 0 warnings in linter checks.

---

*This document is part of PlayGrid V1 Technical Manual.*
