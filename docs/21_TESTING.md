# 21. Testing Guide

## Test Suites
PlayGrid has unit and integration test coverage across client and server.

## Running Tests
- **Backend Tests**: Run `npm test` or `npm run test:coverage` inside `backend/` using **Vitest**.
  - Includes mocks for Firebase Admin SDK and Google GenAI API to prevent network timeouts.
- **Frontend Tests**: Run `npm test` or `npm run test:coverage` inside `frontend/` using **Vitest** and **React Testing Library** (JSDom).

## Mocking Strategies
In frontend test configurations, the `AuthProvider` is mocked to output a stable test user profile, eliminating async state changes and React `act(...)` warning outputs during tests.

---

*This document is part of PlayGrid V1 Technical Manual.*
