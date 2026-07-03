# 28. Data Flow

## Flow Diagram (Post Creation Example)

```mermaid
sequenceDiagram
  Client ->> PostRoutes: POST /api/posts { content }
  PostRoutes ->> ValidateMiddleware: validate(createPostSchema)
  ValidateMiddleware ->> PostController: createPost(req, res)
  PostController ->> PostService: createPost(userId, req.body)
  PostService ->> FraudDetection: containsProfanityOrSpam(content)
  PostService ->> AIService: moderateContent(content)
  AIService -->> PostService: returns isSafe: true
  PostService ->> Prisma: prisma.post.create(...)
  Prisma -->> PostService: returns Post record
  PostService -->> PostController: returns Post record
  PostController -->> Client: returns 201 Created + Post JSON
```

## Description
Data flows linearly through the system:
1. Client actions hit Express routes.
2. Payload structure is verified by the `validate` middleware using Zod schemas.
3. Controller extracts context (like `req.user.id` from `requireAuth`) and hands data off to services.
4. Services evaluate business rules, interact with database queries, and return raw data.
5. Controller shapes response formats and returns appropriate status codes.

---

*This document is part of PlayGrid V1 Technical Manual.*
