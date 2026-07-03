# 18. Database Seeding System

## Commands
Seeding scripts are executed via the following commands in the `backend/` directory:
- `npm run seed:demo`: Seeds a standard demo dataset containing ~400 users, ~500 matches, and ~700 social posts.
- `npm run seed:stress`: Seeds a heavy stress dataset with ~5000 users, ~5000 matches, and ~10000 social posts to test query scaling.
- `npx prisma db seed`: Runs standard developer configuration seeds.

## Mechanism
1. **Wipe**: Uses SQL `TRUNCATE ... CASCADE` raw query to clean all public tables except migrations.
2. **Generators (Factories)**: Generates users, matching profiles, communities, venues (venues), reviews, matches, comments, notifications, and messages.
3. **Chunking**: Database inserts are executed in chunks of `2000` items to prevent database placeholder limitations.
4. **Initialization**: Executes `badgeService.initializeBadges()` at the end of database wipes to pre-load system default achievements.

---

*This document is part of PlayGrid V1 Technical Manual.*
