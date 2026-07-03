# Database Overview

PlayGrid uses **PostgreSQL** as its relational database, managed entirely via the **Prisma ORM**.

## Philosophy

The database acts as the ultimate source of truth. We prioritize strict relational integrity, utilizing foreign keys, unique constraints, and enums to prevent invalid states. Soft deletes are largely avoided in favor of strict cascading deletes for data cleanliness, except where historical records are legally or logically required.

## Core Entities

The application revolves around several deeply interconnected domains:

1. **Users**: The core entity. Users have profiles, reputation scores, and friends (Connections).
2. **Matches**: Instances of sporting events. Matches have creators, venues, sports types, and participants.
3. **Communities**: Groups of users centered around a specific sport or location. They can be Public or Private.
4. **Venues**: Physical locations where matches occur. Venues require administrative approval.
5. **Activity Feed**: An immutable log of social events (match creations, community joins) broadcasted to friends.
6. **Messages**: Direct user-to-user and community group chat messages.
7. **Reviews**: Post-match peer evaluations that affect a user's trust and skill rating.

## Prisma Workflow

All database interactions happen through Prisma.
- The schema is defined in `backend/prisma/schema.prisma`.
- Whenever the schema is modified, `npx prisma db push` (or `migrate dev`) must be run to sync the PostgreSQL instance.
- Prisma automatically generates heavily typed TypeScript clients ensuring that backend services cannot query non-existent columns.
