# 24. Changelog

## V1.0.0 (2026-07-03)

### Changes
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
