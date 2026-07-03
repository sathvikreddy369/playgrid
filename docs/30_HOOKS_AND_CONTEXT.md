# 30. Hooks and Context

## Context Providers

### 1. AuthProvider
- Wraps the React application.
- Integrates with the Firebase client state listener (`onAuthStateChanged`).
- Eagerly triggers database user synchronization on logins.
- Sets user profile details into cache and context scopes.

## Custom Hooks (Examples)

### 1. `useFeed` / `useCreatePost` (TanStack Query)
- Coordinates API requests to fetch social post pages or sync new posts.
- Manages key invalidations to automatically trigger UI updates.

### 2. `useGlobalSearch` / `useAISearch`
- Wraps search queries, checking coordinates during nearby mode or launching POST queries for natural language prompts.

---

*This document is part of PlayGrid V1 Technical Manual.*
