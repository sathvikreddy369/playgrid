# 20. Performance Optimizations

## Frontend Optimizations
- **Code Splitting**: Employs `React.lazy` and Dynamic Imports for heavy pages (like map vendor Mapbox GL or Firebase vendor chunks) to minimize the initial JS bundle size.
- **TanStack Query (React Query)**: Uses caching and query invalidations to prevent duplicate requests on component re-renders.

## Database Optimizations
- **Prisma Schema Indexes**: Schema models are indexed on frequently queried columns:
  - `User`: `firebaseUid`, `email`
  - `Match`: `date`, `sport`, `status`, `latitude`, `longitude`
  - `Ground`: `status`, `latitude`, `longitude`
  - `Post`: `createdAt`, `type`
  - `Message`: `senderId`, `receiverId`, `isRead`
- **Paginated Queries**: Implements cursor-based pagination for social feeds and matches lists.

---

*This document is part of PlayGrid V1 Technical Manual.*
