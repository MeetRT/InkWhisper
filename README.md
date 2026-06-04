# InkWhisper

A self-hosted long-form reading platform optimised for multi-chapter stories and standalone anthology nodes.

## Architecture

```
InkWhisper/
├── frontend/   SvelteKit 5 SPA (mobile-first reader + admin portal)
└── backend/    Node.js / Fastify 5 REST API (Prisma 5 + SQLite)
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- npm ≥ 9 (backend) · yarn (frontend)

---

### 1 — Backend

```bash
cd backend

# Copy and edit environment
cp .env.example .env

# Push schema to SQLite and generate Prisma client
npx prisma db push

# Start dev server (auto-restarts on change)
npm run dev
```

The API will be available at **http://localhost:3001** by default.

| Variable        | Default                   | Description                          |
|-----------------|---------------------------|--------------------------------------|
| `DATABASE_URL`  | `file:./dev.db`           | SQLite file path (relative to `backend/`) |
| `PORT`          | `3001`                    | Fastify listen port                  |
| `HOST`          | `127.0.0.1`               | Bind address (`0.0.0.0` for Docker)  |
| `CORS_ORIGINS`  | `http://localhost:5173`   | Comma-separated allowed origins      |

#### API Endpoints

| Method | Path               | Description                    |
|--------|--------------------|--------------------------------|
| GET    | `/health`          | Liveness check                 |
| GET    | `/nodes`           | List all story nodes (summary) |
| GET    | `/nodes/:id`       | Fetch full story node          |
| POST   | `/admin/nodes`     | Create a new story node        |

**POST `/admin/nodes` body:**

```json
{
  "title": "string (required)",
  "standaloneSynopsis": "string (optional)",
  "textContent": "string (required)",
  "isPremium": false
}
```

`wordCount` is computed server-side and stored automatically.

---

### 2 — Frontend

```bash
cd frontend

# Copy and edit environment
cp .env.example .env

# Install dependencies (already done if you ran sv create)
yarn

# Start dev server
yarn dev
```

The app will be available at **http://localhost:5173**.

| Variable            | Default                  | Description                   |
|---------------------|--------------------------|-------------------------------|
| `VITE_API_BASE_URL` | `http://localhost:3001`  | Backend API base URL          |

#### Routes

| Path               | Description                     |
|--------------------|---------------------------------|
| `/`                | Public library index            |
| `/read/[nodeId]`   | Full-screen reader for a node   |
| `/admin/write`     | Admin: create nodes + dashboard |

---

## Reader Settings

The floating **Aa** button opens a control sheet with:

- **Font style** — Serif (Georgia) · Sans (system-ui) · Legible (Atkinson Hyperlegible)
- **Font size** — 5 steps from 1 rem → 1.75 rem
- **Theme** — ☀️ Light · 🌙 Dark · 🍂 Sepia

All preferences are persisted to `localStorage` and applied instantly via CSS custom properties on `<html>`.

---

## Database Schema

```prisma
model StoryNode {
  id                 Int      @id @default(autoincrement())
  title              String
  standaloneSynopsis String   @default("")
  textContent        String
  wordCount          Int      @default(0)
  isPremium          Boolean  @default(false)
  createdAt          DateTime @default(now())
}
```

---

## Logging

- **Backend** — Pino structured JSON logs, pretty-printed in dev. Every request logs endpoint, response time (ms), and status. DB errors include the failing node ID.
- **Frontend** — `createLogger(MODULE)` utility logs all setting changes (prev → next value) and every fetch lifecycle event (initiation, success, HTTP error with status code).
