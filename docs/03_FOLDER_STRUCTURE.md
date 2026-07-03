# 03. Folder Structure

## Project Layout

```
playgrid/
├── backend/
│   ├── prisma/             # Schema, seeds, migrations
│   └── src/
│       ├── controllers/    # Route controllers
│       ├── middlewares/    # Auth, Validation, Observability middlewares
│       ├── routes/         # Express endpoint mappings
│       ├── services/       # Core business logic
│       ├── utils/          # Logger, Firebase, Cloudinary, Fraud utilities
│       ├── validators/     # Zod input schemas
│       ├── index.ts        # Server entrypoint
│       └── socket.ts       # Socket.IO connection and event handler
├── docs/                   # Complete V1 system documentation
└── frontend/
    └── src/
        ├── components/     # Reusable layout and form items
        ├── hooks/          # TanStack Queries and Mutations
        ├── lib/            # Axios and Firebase Client setup
        ├── pages/          # App pages / screens
        ├── providers/      # React Auth and context providers
        ├── App.tsx         # Route configuration
        └── main.tsx        # React entrypoint
```

## Description
- **`backend/src/services`**: Keeps logic detached from controller HTTP constructs.
- **`backend/src/validators`**: Ensures input payloads are parsed and validated strictly before hitting database layers.
- **`frontend/src/hooks`**: Abstracts data fetching logic away from views, enabling caching, validation, and auto-refreshes.

---

*This document is part of PlayGrid V1 Technical Manual.*
