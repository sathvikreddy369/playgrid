# 27. Code Style

## Coding Standards
PlayGrid enforces clean coding style standards:

### 1. File Naming
- **React Components**: PascalCase (e.g. `PostCard.tsx`, `Layout.tsx`).
- **Services/Controllers/Routes**: camelCase (e.g. `post.controller.ts`, `auth.middleware.ts`).

### 2. Separation of Concerns
- **Controllers**: Handle parsing requests, invoking service layers, and returning HTTP responses. No business logic or database queries should be placed in controllers directly.
- **Services**: Abstract all business rules, validation integrations (e.g. AI moderation), and database accesses.

### 3. TypeScript
- Enforce clean types and interfaces.
- Avoid using `any` unless absolutely necessary (like mapping dynamic test payloads).

---

*This document is part of PlayGrid V1 Technical Manual.*
