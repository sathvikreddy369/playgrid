# Backend Architecture

PlayGrid's backend is a robust Node.js and Express application written in strict TypeScript. It exposes a RESTful API and a synchronized Socket.io server.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Media**: Cloudinary
- **Auth**: Firebase Admin SDK

## Layered Architecture

The backend strictly follows a layered architecture to separate concerns and ensure maintainability:

1. **Routes (`/routes`)**: The entry point for HTTP requests. Routes simply bind endpoints to their respective Controller methods.
2. **Controllers (`/controllers`)**: Responsible for extracting data from the request (`req.body`, `req.params`), calling the appropriate Service, and sending the HTTP response.
3. **Services (`/services`)**: Contains the core business logic. Services enforce rules, validate permissions, and perform database operations via Prisma. 
4. **Middlewares (`/middlewares`)**: Shared logic that runs before controllers. Includes:
   - `requireAuth`: Verifies Firebase JWT tokens.
   - `errorHandler`: Catches and formats thrown `AppError` exceptions.
   - `validateSchema`: Uses Zod to validate request bodies.
   - `rateLimiter`: Protects against brute-force attacks.

## Error Handling

PlayGrid utilizes a centralized error handling strategy. 

Instead of throwing generic JavaScript errors, the backend uses a custom `AppError` class. Services throw `AppError.notFound()`, `AppError.forbidden()`, or `AppError.badRequest()`. The central `errorHandler` middleware catches these, formats them cleanly, logs the trace (if 500), and sends standard JSON responses to the frontend.

## Folder Structure

```
backend/src/
├── controllers/  # Request/Response handlers
├── middlewares/  # Express middlewares (auth, validation, errors)
├── routes/       # Express router definitions
├── services/     # Core business logic and database interactions
├── utils/        # Helper functions, custom structured logger
├── index.ts      # Server bootstrap and HTTP setup
└── socket.ts     # Real-time WebSocket server setup
```
