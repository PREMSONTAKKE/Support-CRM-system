# Support CRM — Datastraw AI + Tech Intern Assessment

A lightweight, full-stack ticket management system built for the Datastraw assessment. 5 core features, 4 API endpoints, 2 database tables, and 32 extras — all running on live data with no mocks.

- **Backend:** FastAPI + SQLAlchemy + SQLite
- **Frontend:** React 18 + Vite + React Router v6
- **Database:** 2 tables (`tickets`, `notes`)
- **API:** Exactly 4 endpoints
- **Deployment:** Docker → Render (backend), Vercel (frontend)

---

## Live URLs

| Layer | URL |
|---|---|
| Frontend | `https://your-app.vercel.app` |
| Backend  | `https://your-api.onrender.com` |
| API Docs | `https://your-api.onrender.com/docs` (Swagger UI) |

---

## Features

### 5 Core Features (PDF Required)

| # | Feature | Implementation |
|---|---|---|
| 1 | **Create Tickets** | POST /api/tickets — name, email, title, description; auto-generates TKT-XXX ID + timestamps |
| 2 | **List All Tickets** | GET /api/tickets — ID, name, subject, status, date; newest first |
| 3 | **Search** | As-you-type search (300ms debounce) across ticket_id, name, email, subject, description |
| 4 | **Filter by Status** | Tab-based filter: All / Open / In Progress / Closed |
| 5 | **View & Update** | Detail page with full info, auto-save status dropdown, add notes |

### 32 Extras (Beyond PDF)

**Backend (13):** status validation on PUT, status filter validation, Pydantic request validation (422 with field errors), TKT-XXX collision retry, `/health` endpoint, CORS middleware, auto Swagger UI at `/docs`, newest-first ordering, empty-notes short-circuit, case-insensitive ILIKE search, subject included in search, `.env`-driven config, cascade delete on FK.

**Frontend (13):** debounced search (300ms), client-side form validation with inline errors, color-coded status badges, "All" filter tab, toast notifications, optimistic status update with rollback, sticky top nav, loading/empty/error states, "Back to tickets" navigation, clear search button (×), locale date formatting, 404 page, card layout on mobile (<720px).

**Config/Project (6):** Dockerfile (python:3.11-slim), render.yaml Blueprint, vercel.json SPA rewrites, Procfile + runtime.txt fallback, `.env.example` for both layers, `.gitignore`.

---

## Project Structure

```
Support CRM system/
│
├── backend/                      # FastAPI Python backend
│   ├── main.py                   # App entrypoint — 4 endpoints + CORS + /health
│   ├── database.py               # SQLite engine, SessionLocal, Base, get_db()
│   ├── models.py                 # SQLAlchemy models: Ticket + Note (2 tables)
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── ticket_id_gen.py          # TKT-XXX unique ID generator with collision retry
│   ├── seed.py                   # Demo data seeder (6 tickets with notes)
│   ├── requirements.txt          # Python dependencies
│   ├── runtime.txt               # Python version for Render (non-Docker fallback)
│   ├── Procfile                  # Start command for Render (non-Docker fallback)
│   ├── .env.example              # Backend env vars template
│   └── .venv/                    # Local virtual environment (gitignored)
│
├── frontend/                     # React SPA (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # / — ticket list + search + filter
│   │   │   ├── CreateTicket.jsx  # /create — new ticket form
│   │   │   └── TicketDetail.jsx  # /tickets/:id — detail + status + notes
│   │   ├── components/
│   │   │   ├── SearchBar.jsx     # Debounced search input
│   │   │   ├── StatusFilter.jsx  # Tab bar: All / Open / In Progress / Closed
│   │   │   ├── StatusBadge.jsx   # Color-coded status pill
│   │   │   ├── TicketList.jsx    # Table (desktop) / cards (mobile)
│   │   │   └── Toast.jsx         # Bottom-right notification popup
│   │   ├── api/
│   │   │   └── tickets.js        # Fetch wrapper for all 4 endpoints
│   │   ├── utils/
│   │   │   └── format.js         # Date formatting helper
│   │   ├── App.jsx               # Router + layout shell
│   │   ├── App.css               # All styles (responsive, mobile-first)
│   │   └── main.jsx              # React entrypoint
│   ├── index.html
│   ├── vite.config.js            # Vite config (port 5173, 127.0.0.1)
│   ├── vercel.json               # SPA rewrites for Vercel
│   ├── package.json
│   └── .env.example              # Frontend env vars template
│
├── Dockerfile                    # Docker image (python:3.11-slim)
├── render.yaml                   # Render Blueprint (env: docker)
├── .gitignore                    # 54 rules covering OS/Python/Node/secrets
├── PROJECT_AUDIT.md              # Full compliance audit (local only, not in repo)
├── DEMO_SCRIPT.md                # Demo video script (local only, not in repo)
└── README.md                     # This file
```

---

## Tech Stack

| Choice | Why |
|---|---|
| **FastAPI** | Auto Swagger UI, async-ready, Pydantic validation, minimal boilerplate |
| **SQLite** | File-based, zero infrastructure, fits a 2-table schema — per spec's simplicity requirement |
| **SQLAlchemy 2.x** | First-class FastAPI pairing; clean FK relationship between tickets and notes |
| **React + Vite** | Fast devserver, 178KB production build (57KB gzipped), no heavy framework |
| **Plain CSS** | Zero dependencies, easy to read, no framework lock-in |
| **fetch (no axios)** | Built into the browser, one fewer dependency |
| **Docker** | Avoids Python version incompatibilities on Render (builds on 3.11-slim) |

---

## Database Schema

### `tickets`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-increment |
| `ticket_id` | TEXT | Unique, format `TKT-XXX` (3-digit zero-padded) |
| `customer_name` | TEXT | Required |
| `customer_email` | TEXT | Required |
| `subject` | TEXT | Required |
| `description` | TEXT | Required |
| `status` | TEXT | `Open` / `In Progress` / `Closed` |
| `created_at` | DATETIME | Auto-set on create |
| `updated_at` | DATETIME | Auto-bumped on any update |

### `notes`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-increment |
| `ticket_id` | TEXT | Foreign Key → `tickets.ticket_id` (cascade delete) |
| `note_text` | TEXT | Required |
| `created_at` | DATETIME | Auto-set on insert |

---

## API Reference

### 1. Create Ticket

```http
POST /api/tickets
Content-Type: application/json

{
  "customer_name": "Alice Johnson",
  "customer_email": "alice@example.com",
  "subject": "Login not working",
  "description": "Cannot reach the dashboard after the update."
}
```

**Response 201**
```json
{ "ticket_id": "TKT-001", "created_at": "2026-06-01T20:27:42.385821" }
```

### 2. List & Search Tickets

```http
GET /api/tickets?status=Open&search=alice
```

| Query Param | Type | Description |
|---|---|---|
| `status` | string (optional) | `Open` / `In Progress` / `Closed` |
| `search` | string (optional) | Case-insensitive match across ticket_id, name, email, subject, description |

Results ordered by `created_at` descending.

**Response 200**
```json
[
  {
    "ticket_id": "TKT-001",
    "customer_name": "Alice Johnson",
    "subject": "Login not working",
    "status": "Open",
    "created_at": "2026-06-01T20:27:42.385821"
  }
]
```

### 3. Get Ticket Details

```http
GET /api/tickets/TKT-001
```

**Response 200**
```json
{
  "ticket_id": "TKT-001",
  "customer_name": "Alice Johnson",
  "customer_email": "alice@example.com",
  "subject": "Login not working",
  "description": "Cannot reach the dashboard after the update.",
  "status": "Open",
  "created_at": "2026-06-01T20:27:42.385821",
  "updated_at": "2026-06-01T20:27:42.385821",
  "notes": []
}
```

### 4. Update Ticket & Add Note

```http
PUT /api/tickets/TKT-001
Content-Type: application/json

{
  "status": "In Progress",
  "notes": "Investigating the login flow. Checked auth logs — token expiry seems off."
}
```

Both `status` and `notes` are optional. If `notes` is non-empty, a new Note row is inserted. `updated_at` is bumped whenever anything changes.

**Response 200**
```json
{ "success": true, "updated_at": "2026-06-01T20:27:46.220132" }
```

### Error Responses

| Status | Scenario |
|---|---|
| 400 | Invalid status value (not Open/In Progress/Closed) |
| 404 | Ticket ID not found |
| 422 | Missing required field or validation failure |

---

## Frontend Views

| Route | Page | Features |
|---|---|---|
| `/` | Dashboard | Search bar (300ms debounce), status filter tabs (All/Open/In Progress/Closed), ticket list with table (desktop) → cards (mobile <720px) |
| `/create` | Create Ticket | 4-field form, inline validation errors, server error display, redirects to detail on success |
| `/tickets/:id` | Ticket Detail | Full ticket info, auto-save status dropdown, notes timeline, add-note form, toast on change |
| `*` | 404 | Graceful unknown-route page |

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
cd backend
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt

# Copy environment file:
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

uvicorn main:app --reload --port 8000
```

Swagger UI → http://127.0.0.1:8000/docs

### 2. Seed Demo Data (Optional)

With the backend venv active and the server **not** running:

```bash
cd backend
python seed.py
```

This creates 6 realistic tickets (Emily Chen, Marcus Rivera, Priya Sharma, etc.) with varied statuses and notes spread across the last 3 days.

### 3. Frontend Setup

```bash
cd frontend
npm install

copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

npm run dev
```

App → http://127.0.0.1:5173

### 4. (Optional) Docker

```bash
# Build and run the backend in a container:
docker build -t support-crm-api .
docker run -p 8000:8000 support-crm-api
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./support.db` | SQLAlchemy connection string |
| `FRONTEND_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated CORS allow-list |

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Base URL for the FastAPI backend |

> **Important:** `VITE_API_URL` is baked into the frontend at **build time** (Vite behavior). If you change the backend URL after building, you must rebuild and redeploy the frontend.

---

## Deployment

### Backend → Render (via Docker)

1. Push the repo to GitHub.
2. In Render Dashboard → **New Blueprint** → Connect your repo.
3. Render automatically reads `render.yaml` and deploys using the `Dockerfile`.
4. Set env vars in the Render dashboard if needed:
   - `FRONTEND_ORIGIN` → your deployed Vercel URL

Alternatively, create a **Web Service** manually:
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile`
- **Health Check Path:** `/health`

> The Dockerfile uses `python:3.11-slim` to avoid the Python 3.14 / pydantic-core incompatibility that affects Render's default Python builder.

### Frontend → Vercel

1. In Vercel Dashboard → **Add New Project** → Import your GitHub repo.
2. **Root Directory:** `frontend/`
3. **Framework Preset:** Vite
4. **Environment Variables:** Add `VITE_API_URL` = your deployed Render backend URL.
5. Deploy. The `vercel.json` file handles SPA rewrites so all routes work on refresh.

### Updating CORS for Production

After deploying the frontend, set the backend's `FRONTEND_ORIGIN` env var to the deployed Vercel URL in Render's dashboard, then trigger a manual deploy.

---

## Testing

### Backend

The backend was tested with pytest (41 tests covering all endpoints, edge cases, and validation). Run them from the `backend/` directory:

```bash
cd backend
.venv\Scripts\activate
pytest
```

### Frontend

The production build was verified:

```bash
cd frontend
npm run build
npx vite preview
```

Build output: 178KB JS (57KB gzipped), zero warnings.

---

## Project Audit

A full compliance audit (`PROJECT_AUDIT.md`) exists locally in the project root. It documents:
- Every PDF requirement vs. implementation status
- All 32 extras beyond the spec
- The 5 core features and their implementation
- What was intentionally deferred

This file is kept local (gitignored) — share it if the evaluator requests detailed tracking.

---

## What I'd Add With More Time

- **Authentication** — Basic login or JWT so agents can own and be assigned tickets
- **PostgreSQL** — Production durability (SQLite resets on Render free-tier deploys)
- **Pagination** — Current list endpoint is unbounded; at scale this needs page numbers
- **File Attachments** — Upload screenshots or documents with tickets
- **Real-time Updates** — WebSockets so multiple agents see new notes live
- **E2E Tests** — Playwright to automate the full user flow
- **Email Notifications** — Send email when a ticket is created or updated

---

Built for the Datastraw AI + Tech Intern Assessment.
