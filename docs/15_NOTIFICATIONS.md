# 15. Notifications

## Overview
Alerts users about match reminders, join requests, approval states, replies, and system alerts.

## Delivery Channels

### 1. Database Store
- Created via `notificationService.createNotification`.
- Fetched dynamically in the notification bell with pagination.
- Supports marking all or individual alerts as read.

### 2. Real-Time Socket Push
- On creation, the backend attempts to load the Socket.IO instance and pushes a `new_notification` payload to `user:${userId}`.
- Allows clients to display unread badge updates and toast messages instantly.

---

*This document is part of PlayGrid V1 Technical Manual.*
