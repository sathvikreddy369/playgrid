# PlayGrid Architecture & System Design

PlayGrid is built using a modern decoupled architecture. The frontend is a React Single Page Application (SPA), while the backend is an Express Node.js REST API powered by PostgreSQL. 

## High-Level Architecture

```mermaid
graph TD
    Client[React Frontend / Web Browser]
    
    subgraph PlayGrid Infrastructure
        API[Express API Server]
        WSS[Socket.IO Server]
        DB[(PostgreSQL)]
        Worker[Background Tasks]
    end
    
    subgraph Third-Party Integrations
        Firebase[Firebase Auth]
        Gemini[Google Gemini AI]
        Cloudinary[Cloudinary CDN]
    end

    Client -- REST HTTP --> API
    Client -- WebSockets --> WSS
    Client -- Token Auth --> Firebase
    
    API -- Prisma ORM --> DB
    WSS -- Session Status --> DB
    API -- Review Processing --> Worker
    
    Worker -- Async Inference --> Gemini
    API -- Image Uploads --> Cloudinary
```

## Backend Design Patterns

### 1. Controller-Service Pattern
The backend isolates business logic from HTTP transport logic. 
- **Controllers** (`src/controllers/`) handle HTTP requests, request validation (via Zod), and JSON serialization.
- **Services** (`src/services/`) hold the core business logic and Prisma ORM interactions.

### 2. Observability & Logging
Every request passes through the `observabilityMiddleware` which attaches a unique `X-Request-ID`. A `StructuredLogger` outputs strictly JSON-formatted logs for automated ingestion by systems like Datadog or ELK.

### 3. Asynchronous AI Processing
Heavy tasks like AI review summarization using Gemini are handled outside the main request thread to prevent blocking the Node.js event loop.

## Database Entity-Relationship (ER) Diagram

Below is the database schema mapping the relationships between Users, Matches, Communities, and Grounds.

```mermaid
erDiagram
    USER ||--o{ PROFILE : "has one"
    USER ||--o{ POST : writes
    USER ||--o{ MATCH : creates
    USER ||--o{ MATCH_PLAYER : participates
    USER ||--o{ COMMUNITY : owns
    USER ||--o{ GROUND : owns

    MATCH ||--o{ MATCH_PLAYER : "has many"
    MATCH ||--o{ MATCH_COMMENT : "has many"
    MATCH }|--o| COMMUNITY : "belongs to (optional)"

    COMMUNITY ||--o{ COMMUNITY_MEMBER : "has many"
    COMMUNITY ||--o{ POST : "contains"

    GROUND ||--o{ GROUND_REVIEW : "receives"
    USER ||--o{ GROUND_REVIEW : "writes"

    POST ||--o{ REPLY : "has many"
    POST ||--o{ POST_LIKE : "has many"

    USER {
        string id PK
        string email UK
        string name
        enum role
        int reputation
        boolean isBlocked
    }

    PROFILE {
        string id PK
        string userId FK
        string bio
        string location
        string avatarUrl
        string[] sports
    }

    MATCH {
        string id PK
        string title
        datetime date
        string location
        int maxPlayers
        enum status
        string creatorId FK
        string communityId FK
    }

    COMMUNITY {
        string id PK
        string name
        enum status
        string ownerId FK
    }

    GROUND {
        string id PK
        string name
        string location
        enum status
        string ownerId FK
        string aiSummary
    }
```

## Scalability Choices

1. **Pagination**: Core list endpoints implement `skip/take` pagination to limit payload sizes and query times.
2. **Indexing**: Spatial coordinates (`latitude`, `longitude`) and heavily filtered fields (`status`, `date`) are indexed in PostgreSQL.
3. **Caching Strategy**: The frontend leverages React Query to aggressively cache immutable data (like static profiles or completed matches) while keeping real-time data fresh.
