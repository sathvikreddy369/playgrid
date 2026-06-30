# Contributing to PlayGrid

We welcome contributions to make PlayGrid the best sports matchmaking platform! 

## Engineering Standards

To maintain a FAANG-tier codebase, we adhere strictly to the following standards:

### 1. TypeScript Strictness
Do **not** use the `any` type. If you are introducing a new data structure, declare an interface in `frontend/src/types/index.ts` or leverage Prisma's generated types in the backend. PRs containing the `any` type will be rejected.

### 2. Error Handling & Reliability
- **Frontend**: All new top-level route pages must be wrapped (or fall under the global) `ErrorBoundary`. Use `Skeleton` loaders for async states.
- **Backend**: Never leak stack traces to the client. Throw standard HTTP errors and let the global `errorHandler` middleware obscure the stack and return an `errorId`.

### 3. Database Modifications
If you need to change the schema in `backend/prisma/schema.prisma`:
1. Modify the schema.
2. Run `npx prisma format` to keep it clean.
3. Add a migration via `npx prisma migrate dev --name <descriptive_name>`.
4. Ensure new foreign keys have corresponding `@@index` entries to prevent sequential scans.

## Running Tests

All business logic should have test coverage. We use **Vitest**.

### Backend
```bash
cd backend
npm run test
```
*Note: Backend tests mock the Prisma client (`vi.mock('../utils/db')`). Ensure you do not hit the live database during unit tests.*

### Frontend
```bash
cd frontend
npm run test
```

## Pull Request Process

1. Fork the repo and create your branch from `main`.
2. Ensure you have added relevant tests.
3. Ensure the test suite passes.
4. Follow Conventional Commits for your commit messages (e.g., `feat: add tournament support`, `fix: pagination offset calculation`).
5. Open a PR with a clear summary of your changes.
