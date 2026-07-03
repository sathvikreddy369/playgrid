# 23. Known Limitations

## Current Restrictions in V1

### 1. Spatial Geospatial Queries
- Uses Haversine calculations inside PostgreSQL raw queries (`$queryRaw`) as a spatial query approximation.
- **Limitation**: While fine for moderate databases, it does not use specialized geographic indexing (like PostGIS `GIST` indexes) which is better for global-scale queries.

### 2. Message History Pagination
- Direct messages are loaded immediately on opening chat windows.
- **Limitation**: There is no lazy-loading or pagination implemented for large message histories in chat threads.

### 3. AI Moderation Fail Open
- If the Gemini API fails or runs out of credits, content moderation defaults to active / safe (`isSafe: true`).
- **Limitation**: Ensures a seamless user experience, but leaves the platform briefly unmoderated during external API outages.

---

*This document is part of PlayGrid V1 Technical Manual.*
