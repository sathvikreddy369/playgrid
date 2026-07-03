# 11. Communities

## Design
Communities are user-created hubs. They link matching sports enthusiasts together and host exclusive matches or posts.

## Workflows
- **Creation**: Users create communities. They start in a `PENDING` state and require approval from an Administrator.
- **Membership**: Anyone can join a community. The creator is added as the initial member automatically.
- **Moderation**: Community owners can kick members. Platform administrators have global bypass rights to kick members or delete community entities.
- **Verification**: Admin dashboard resolves queue items, moving community status to `VERIFIED` or `REJECTED`.

---

*This document is part of PlayGrid V1 Technical Manual.*
