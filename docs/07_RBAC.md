# 07. Role-Based Access Control (RBAC)

## User Roles
PlayGrid supports four hierarchical roles configured in `Prisma`:
1. **GUEST**: Unauthenticated visitor. Can discover matches, view communities, search venues.
2. **PLAYER**: Standard user. Can sync profiles, join matches, comment, chat, like, review.
3. **ORGANIZER**: Promoted user. Can host official tournaments and venues.
4. **ADMIN**: Platform administrator. Full access to block users, delete posts, and resolve moderation flags.

## Middleware Enforcements
Role checks are executed through the `requireRole` middleware factory:
```typescript
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};
```
- **Example Usage**: `router.use(requireAuth, requireRole(['ADMIN']))` in `/routes/admin.routes.ts`.

---

*This document is part of PlayGrid V1 Technical Manual.*
