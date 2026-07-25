# PlayGrid...

> A modern, real-time social platform for community sports and localized match discovery.

PlayGrid is a project designed to bridge the gap between digital social networks and real-world physical activity. It enables users to discover local sports matches, join geographically anchored communities, and build verifiable reputations based on reliability and skill.

---

## 📸 Screenshots

*(Replace with actual screenshots in production)*

| Landing Page | Home Feed | Match Details |
| :---: | :---: | :---: |
| ![Landing Placeholder](docs/assets/landing.png) | ![Home Placeholder](docs/assets/home.png) | ![Match Placeholder](docs/assets/match.png) |

| Community Board | Venue Map | User Profile |
| :---: | :---: | :---: |
| ![Communities Placeholder](docs/assets/communities.png) | ![Venues Placeholder](docs/assets/venues.png) | ![Profile Placeholder](docs/assets/profile.png) |

---

## 📑 Table of Contents

- [About PlayGrid](#about-playgrid)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Database Overview](#database-overview)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Development Workflow](#development-workflow)
- [Code Quality](#code-quality)
- [Security Notes](#security-notes)
- [Performance Considerations](#performance-considerations)
- [Accessibility](#accessibility)
- [Mobile Support](#mobile-support)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Authors & Acknowledgements](#authors--acknowledgements)

---

## 🎯 About PlayGrid

### Purpose
Community sports often suffer from fragmentation. Discovering local games, organizing player lists, and managing cancellations usually requires a mess of group chats across various apps. 

### Core Idea
PlayGrid centralizes community sports by providing a unified, real-time platform where matches are treated as discoverable entities. Users can browse active matches on a map, RSVP to games with skill-based restrictions, and evaluate peers post-match.

### Target Audience
Casual athletes, amateur leagues, community organizers, and anyone looking to find a pick-up game in their city.

---

## ✨ Features

### Social & Discovery
- **Activity Feed**: Real-time scrolling feed of friends' activities (match creations, community joins).
- **Match Engine**: Geographic match discovery, strict RSVP flows, and role-based player management.
- **Venue System**: Mapbox-integrated facility browsing with administrative verification.
- **Communities**: Public and Private silos for specialized groups or local leagues.

### Communication & Trust
- **Real-Time Messaging**: Direct user-to-user and community group chat powered by Socket.IO.
- **Trust System**: Peer-reviewed reputation tracking focusing on reliability and sportsmanship.
- **AI Coaching**: Gemini-powered AI chat integration for instant sports advice and logistics.
- **Robust Notifications**: Immediate socket-pushed alerts for match invites and friend requests.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack React Query
- **Routing**: React Router DOM (v7)

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Realtime**: Socket.IO

### Data & Infrastructure
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Firebase Admin SDK
- **Storage**: Cloudinary (Media), Mapbox (Maps)

---

## 🏛 Architecture Overview

PlayGrid follows a strictly decoupled Monolithic architecture:
1. **Frontend SPA**: A Vite-bundled React application consuming standard JSON REST payloads.
2. **Backend API**: A layered Express application (`Routes -> Controllers -> Services`) enforcing all business logic.
3. **Socket Layer**: A concurrent WebSocket server handling all real-time messaging, presence tracking, and notification dispatches.

For a deeper dive, read the [Architecture Documentation](docs/architecture.md).

---

## 📁 Folder Structure

```text
playgrid/
├── backend/                  # Express/Node.js API
│   ├── prisma/               # Database schemas, migrations, and seeders
│   └── src/
│       ├── controllers/      # Request parsers and response handlers
│       ├── middlewares/      # Auth, error, and validation guards
│       ├── routes/           # Endpoint definitions
│       ├── services/         # Core business logic
│       ├── socket.ts         # Real-time WebSocket handlers
│       └── index.ts          # Server entry point
├── frontend/                 # React SPA
│   └── src/
│       ├── components/       # Reusable shadcn/ui and custom components
│       ├── hooks/            # TanStack React Query data fetchers
│       ├── lib/              # Utility functions and API configs
│       ├── pages/            # Routable top-level views
│       └── providers/        # Global React Contexts (Auth)
├── docs/                     # Comprehensive architecture documentation
└── CHANGELOG.md              # Project history and release notes
```

---

## 🗄 Database Overview

The PostgreSQL database is heavily normalized and managed entirely by Prisma.
Key entities include:
- `User` and `UserConnection` (Social Graph)
- `Match`, `MatchParticipant`, and `Venue` (Match Engine)
- `Community`, `CommunityMember` (Community System)
- `Post`, `Comment`, `Message` (Social & Real-time)

For schema philosophies, read the [Database Documentation](docs/database.md).

---

## 🔑 Environment Variables

To run PlayGrid, you must configure `.env` files in both the `frontend/` and `backend/` directories.

A unified template containing explanations of every required key can be found in [`.env.example`](.env.example) at the root of the repository. **Never commit actual `.env` files.**

---

## 🚀 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or Docker)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/playgrid.git
   cd playgrid
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example backend/.env
   cp .env.example frontend/.env
   # Fill in the required credentials for Firebase, Cloudinary, and Mapbox
   ```

3. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Initialize Database (from the `backend` folder):**
   ```bash
   npx prisma db push
   npm run seed
   ```

5. **Run the Application:**
   ```bash
   # Terminal 1 (Backend)
   cd backend && npm run dev
   
   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```

For detailed troubleshooting, read the [Setup Guide](docs/setup.md).

---

## 📜 Available Scripts

### Backend (`/backend`)
- `npm run dev`: Starts the Express server with Nodemon for hot-reloading.
- `npm run build`: Compiles TypeScript to JavaScript in the `/dist` directory.
- `npm run start`: Runs the compiled production code.
- `npm run test`: Executes the Vitest test suite.
- `npm run seed`: Runs the primary Prisma database seeders.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the optimized production bundle.
- `npm run lint`: Runs `oxlint` across the source code.
- `npm run test`: Executes frontend Vitest suites.

---

## 🔄 Development Workflow

1. **Branching**: Always branch off `main` for new features (`feature/my-feature`).
2. **Database Changes**: Modify `backend/prisma/schema.prisma`, then run `npx prisma db push` (or `npx prisma migrate dev` for production-tracked migrations).
3. **Commit Standards**: Use conventional commits (e.g., `feat:`, `fix:`, `refactor:`).

---

## 🛡 Code Quality & Security

- **Strict TypeScript**: `tsc --noEmit` ensures absolute type safety across both frontend and backend boundaries via Prisma's generated types.
- **API Protection**: All backend routes use centralized `express-rate-limit` to prevent brute force, and Zod schemas to guarantee input validation.
- **RBAC**: Multi-layered authorization guarantees users cannot spoof interactions within private communities or secure match lobbies.

---

## ⚡ Performance Considerations

- **Server State**: React Query aggressive caching minimizes redundant network requests.
- **Asset Optimization**: All user uploads (avatars, venue images) are compressed and optimized on the fly via Cloudinary.
- **Socket Efficiency**: Disconnect handlers accurately measure multi-tab presence to prevent socket state leaking.

---

## ♿ Accessibility (a11y) & 📱 Mobile Support

PlayGrid is designed with a **mobile-first responsive philosophy** using Tailwind CSS. 
The UI relies heavily on Radix primitives via `shadcn/ui`, ensuring complex components (like Dialogs and Dropdowns) maintain strict ARIA compliance, screen reader support, and standard keyboard navigation.

---

## 📚 Documentation

Detailed internal documentation is available in the [`/docs`](docs/) directory:

- [System Architecture](docs/architecture.md)
- [Frontend Stack](docs/frontend.md)
- [Backend APIs](docs/backend.md)
- [Socket.IO Real-time Engine](docs/realtime.md)
- [Authentication Flow](docs/authentication.md)
- [Database Overview](docs/database.md)

---

## 🗺 Roadmap

PlayGrid is officially in **Public Beta**. Upcoming focus areas include:
- Native iOS & Android React Native applications.
- Formal tournament and bracket generation systems.
- Venues booking engine.

For details, view the [Future Roadmap](docs/roadmap.md).

---

## 🤝 Contributing

We welcome contributions! Please ensure any submitted Pull Requests conform to the repository's strict TypeScript and linting standards. All new services must include accompanying integration tests.

---

## 📄 License

This project is licensed under the MIT License.

---

## ✍️ Authors & Acknowledgements

- Designed and engineered by the PlayGrid Core Team.
- Special thanks to the open-source communities behind React, Express, Prisma, and Tailwind CSS that made this architecture possible.
