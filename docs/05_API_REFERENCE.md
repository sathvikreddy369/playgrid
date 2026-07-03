# 05. API Reference

## Base URL
`/api`

## Core Endpoint Map

| Method | Route | Description | Auth Required |
|:---|:---|:---|:---|
| **POST** | `/auth/sync` | Syncs firebase user details to SQL user. | Yes (Firebase JWT) |
| **GET** | `/auth/me` | Fetch active user credentials. | Yes |
| **PUT** | `/auth/profile` | Update profile information. | Yes |
| **GET** | `/posts` | Paginated search of social feed. | No |
| **POST** | `/posts` | Publish a social post. | Yes |
| **POST** | `/posts/:id/replies` | Reply to a post. | Yes |
| **GET** | `/matches` | Discover scheduled matches. | No |
| **POST** | `/matches` | Host a match. | Yes |
| **POST** | `/matches/:id/join` | Request to join match. | Yes |
| **PUT** | `/matches/:id/players/:userId/approve` | Approve join request. | Yes (Host) |
| **POST** | `/matches/:id/players/:userId/attend` | Confirm attendance and rate. | Yes (Host) |
| **GET** | `/venues` | View venues. | No |
| **POST** | `/venues` | Register a new venue. | Yes |
| **POST** | `/venues/:id/reviews` | Write a venue review. | Yes |
| **GET** | `/communities` | Browse list. | No |
| **POST** | `/communities` | Register community. | Yes |
| **GET** | `/search` | Global query. | No |
| **POST** | `/search/ai` | AI query parsing. | Yes |
| **POST** | `/upload` | Multer + Cloudinary upload. | Yes |
| **GET** | `/admin/stats` | Panel stats counters. | Yes (Admin) |
| **PUT** | `/admin/users/:id/block` | Toggle user block. | Yes (Admin) |

---

*This document is part of PlayGrid V1 Technical Manual.*
