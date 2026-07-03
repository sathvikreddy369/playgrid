# Frontend Architecture

PlayGrid's frontend is a modern React Single Page Application built with Vite for incredibly fast Hot Module Replacement (HMR) and optimized production builds.

## Tech Stack

- **Framework**: React 19
- **Bundler**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix primitives)
- **State Management**: TanStack React Query (Server State), React Context (Local Auth State)
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Folder Structure

```
frontend/src/
├── components/   # Reusable UI components (buttons, cards, dialogs)
├── hooks/        # Custom React hooks containing all react-query logic
├── lib/          # Utilities, API client configuration, styling helpers
├── pages/        # Route-level components mapping directly to application views
├── providers/    # Global context providers (AuthProvider)
└── types/        # Global TypeScript interfaces
```

## State Management Philosophy

PlayGrid heavily relies on **Server State** over global client state. Instead of Redux or Zustand, we use **TanStack React Query**. 

- API data is fetched, cached, and synchronized by React Query inside custom hooks (e.g., `useMatches`, `useCommunities`).
- Components simply consume these hooks, ensuring they always have the most up-to-date data without manual global state synchronization.
- **Client State** is kept localized to components using standard `useState`, except for Authentication, which utilizes a React Context (`AuthProvider`) to globally track the logged-in user session.

## Routing

Routing is managed via `react-router-dom` at the root `App.tsx`. 
- **Public Routes**: Accessible by anyone (Landing, Login, Signup).
- **Private Routes**: Wrapped in an `AuthGuard` component that automatically redirects unauthenticated users to the login screen.
