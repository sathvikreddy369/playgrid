# 10. Search System

## Overview
PlayGrid uses three search mechanisms: Global text match, AI natural language parsing, and spatial geographic calculations.

## Spatial Geographic Queries
Distance search is executed on matches and venues. It calculates geo-distance in kilometers using the Haversine formula inside PostgreSQL raw queries:
```sql
(6371 * acos(
  LEAST(1.0, GREATEST(-1.0,
    cos(radians($lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians($lng))
    + sin(radians($lat)) * sin(radians(latitude))
  ))
)) AS distance
```
This is filtered by a distance threshold (radius in km) and ordered nearest-first.

## AI Search Route
1. Client POSTs natural language query to `/api/search/ai`.
2. `SearchService` sends the query to Gemini to extract filters.
3. Express maps filters to Prisma queries and returns the results.

---

*This document is part of PlayGrid V1 Technical Manual.*
