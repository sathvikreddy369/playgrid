# PlayGrid Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to Semantic Versioning.

## [Unreleased] - Phase 10: Final Polish (Public Beta Ready)

### Added
- **Social Graph Engine**: Friends, connection requests, robust friend search.
- **Activity Feed Engine**: Rich real-time newsfeed tracking match creations, community joins, match outcomes, and friend connections.
- **Advanced Match Engine**: Geographic match discovery, RSVP flow (Approve/Reject/Attend), skill-based restrictions, automatic role assignment.
- **Venue & Facility System**: Integrated map rendering (Mapbox), venue details, operating hours, active matches per venue, and admin approval workflows for new venues.
- **Community System**: Public/Private communities, rich member management, community announcements, and dedicated chat rooms per community.
- **Real-time Messaging**: Real-time socket-based messaging for direct friend chats and community group chats.
- **Notification Engine**: Robust notification dispatching across the app using Socket.io for immediate delivery (Match invites, friend requests, community updates).
- **Reputation & Review System**: End-of-match peer reviews, skill verification voting, badges (MVP, Fair Play), and automated suspension system for toxicity.
- **AI Integration**: Gemini-powered AI sports coach integrated directly into user chat for automated tips, injury advice, and match prep.
- **Robust Authentication**: Secure Firebase auth integration synced reliably with local PostgreSQL tables.

### Changed
- **UI/UX Aesthetics**: Repository completely overhauled into a modern, dark-mode focused, glassmorphic design system using Tailwind CSS, framer-motion micro-animations, and `shadcn/ui` components.
- **Performance Improvements**: Codebase migrated from bloated initial setup to strict TypeScript interfaces. Image optimization via Cloudinary. Real-time connections managed aggressively to prevent socket leaks.
- **API Standardization**: Centralized error handling across all backend Express routes mapping to structured, standardized HTTP responses (`AppError`).

### Fixed
- **Socket Multi-tab Presence**: Fixed premature offline presence status caused by single-tab closure when multi-tab sessions are active.
- **Stale Dependencies**: Removed unused frontend libraries (like `glob`) and dead variables/imports to ensure an absolutely clean Webpack/Vite bundle.

### Security
- **Strict Role-based Access Control (RBAC)**: Validations at every service layer to prevent users from interacting with communities they aren't part of, matches they haven't joined, or venues they don't own.
- **Brute Force Mitigations**: Added `express-rate-limit` to authentication and sign-up API surfaces to prevent malicious signup automation.
- **Private Sockets**: Hardened Socket.io room joins to require explicit database lookup ensuring private data remains invisible to bad actors.

---

*This document marks the completion of the 10-phase foundational build of PlayGrid. The application is officially entering Public Beta.*
