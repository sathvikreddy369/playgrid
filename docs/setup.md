# Setup & Installation

This guide will walk you through getting PlayGrid running on your local machine for development.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL**: Running locally or via Docker

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/playgrid.git
cd playgrid
```

## 2. Environment Variables

Create `.env` files in both the frontend and backend directories. You can copy the provided `.env.example` file located at the repository root as a reference.

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

*Note: You will need to provision your own Firebase, Cloudinary, and Mapbox credentials for local development.*

## 3. Install Dependencies

You will need to install dependencies in both directories.

```bash
# Terminal 1: Backend
cd backend
npm install

# Terminal 2: Frontend
cd frontend
npm install
```

## 4. Database Setup

Ensure PostgreSQL is running. Then, use Prisma to push the schema and seed the database.

```bash
cd backend
npx prisma db push
npm run seed
```

## 5. Run the Application

Start the development servers.

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend REST API at `http://localhost:5000`.
