# Changelog

## [Unreleased] - Phase 3: Match Engine Overhaul
- **Match Engine**: Introduced `MatchLifecycleService` for background state transitions (`ONGOING`, `COMPLETED`, `ARCHIVED`, `EXPIRED`).
- **Match Engine**: Added `WAITLISTED` logic for joining `FULL` matches.
- **Match Engine**: Differentiated `WITHDRAW` (approved) vs `CANCEL_JOIN` (pending).
- **Match API**: Added `PUT /matches/:id/edit`, `PUT /matches/:id/status`, `POST /matches/:id/message`.
- **Reviews API**: Added `POST /matches/:id/reviews` for users to rate attended matches.
- **Discussion System**: Added ability to edit and delete comments (`PUT /matches/:id/comments/:commentId`, `DELETE ...`).
- **Frontend**: Overhauled `MatchDetail.tsx` with Host Dashboard, Reviews Section, Waitlist tracking, and manual status updates.
- **Socket**: Connected `MatchDetail.tsx` to `socket.ts` for real-time `match_updated`, `participant_joined`, and `participant_left` events.

## [Phase 3] - Profile Redesign & Overhaul

### Added
- `UserReview` and `UserConnection` models to Prisma schema to support player reviews and social connections.
- Privacy settings functionality allowing users to control their profile visibility, activity timeline, and communities.
- `StatsGrid` component displaying matches hosted, matches joined, communities, and attendance rate on profiles.
- `ActivityTimeline` component visualizing recent user activities natively on profiles.
- `BadgeGrid` component prominently displaying user achievements.
- Complete redesign of the `Profile` and `UserPublicProfile` pages, introducing dynamic tabs for Activity, Matches, Communities, and Posts.
- Dedicated `addUserReview` and `connectUser` endpoints in the `user.controller.ts`.

### Changed
- Expanded `getUserProfile` API to return deep aggregated statistics via Prisma `_count`.
- Overhauled `Settings.tsx` to handle expanded `privacySettings` controls and integrated an `/upload` controller utilizing Cloudinary for avatar image uploads.
- Expanded `Search.tsx` to handle User mapping and displaying, effectively completing the global search engine.
- Development seeder scripts updated to automatically generate simulated user reviews and connections.

## [Phase 2] - Production Optimization

### Added
- Activity tracking engine (ActivityService, Models, and APIs) for User Profiles.
- Match lifecycle background worker handling automatic status updates (`OPEN` -> `ONGOING` -> `COMPLETED` -> `ARCHIVED`).
- New Venue attributes (amenities, coordinates, rating, rules).
- Multi-faceted Search capabilities for Venues (by sport, location, rating).
- New specific UI elements for Venue Details with Google Maps integration and Photo galleries.
- Standardized skeleton loaders across major pages (`Matches`, `Communities`, `UserPublicProfile`, `Feed`, `Venues`).
- Application-wide standard toast notifications utilizing `react-hot-toast` replacing native alerts.

### Changed
- Light mode consistency enforced (stripped generic `dark:` configurations causing invisible inputs).
- Unified avatar elements globally utilizing the `UserLink` wrapper component for robust profile navigation.
- Overhauled `MatchDetail` UI enforcing state-specific action limits.
- Optimized and modernized `UserPublicProfile` and `Settings` components layout matching design principles.
- Filter criteria in Feed based on location and extensive post types.

### Fixed
- Input visibility bug in multiple forms and pages (Create Post, Settings, Match Join).
- Duplicate entry logic blocks enforced at database constraints level in the schema and backed by server logic (Match joins, communities).
- Type inference mismatches inside logger implementation and lifecycle hooks.
