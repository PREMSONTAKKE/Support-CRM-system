# Support CRM

A lightweight, full-stack ticket management system. 5 core features, 4 API endpoints, 2 database tables — all running on live data with no mocks.

- **Backend:** FastAPI + SQLAlchemy + SQLite
- **Frontend:** React 18 + Vite + React Router v6
- **Database:** 2 tables (`tickets`, `notes`)
- **API:** 4 endpoints
- **Deployment:** Docker → Render (backend), Vercel (frontend)

---

## Live URLs

| Layer | URL |
|---|---|
| Frontend | `https://support-crm-system-seven.vercel.app` |
| Backend  | `https://support-crm-system-lfsg.onrender.com` |
| API Docs | `https://support-crm-system-lfsg.onrender.com/docs` (Swagger UI) |

---

## What It Does

### The 5 Core Features

| # | Feature | How It Works |
|---|---|---|
| 1 | **Create Tickets** | POST /api/tickets — customer name, email, subject, description; auto-generates a TKT-XXX ID and timestamps |
| 2 | **List All Tickets** | GET /api/tickets — returns ID, name, subject, status, created date; newest tickets first |
| 3 | **Search** | Start typing in the search bar — it debounces 300ms then searches across ticket IDs, names, emails, subjects, and descriptions |
| 4 | **Filter by Status** | Click a tab: All / Open / In Progress / Closed — the list updates instantly |
| 5 | **View & Update** | Click any ticket to see full details; change the status dropdown (auto-saves) or add a note |

---

## Project Structure

```
Support CRM system/
│
├── backend/                      # My FastAPI Python backend
│   ├── main.py                   # App entry — 4 endpoints + CORS + /health
│   ├── database.py               # SQLite engine, session factory, Base, get_db()
│   ├── models.py                 # SQLAlchemy models: Ticket + Note
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── ticket_id_gen.py          # TKT-XXX generator with collision retry
│   ├── seed.py                   # Seeds 6 demo tickets with notes
│   ├── requirements.txt          # Python deps
│   ├── runtime.txt               # Python version (non-Docker fallback)
│   ├── Procfile                  # Start command (non-Docker fallback)
│   ├── .env.example              # Env vars template
│   └── .venv/                    # Virtual env (gitignored)
│
├── frontend/                     # My React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # / — search, filter, ticket list
│   │   │   ├── CreateTicket.jsx  # /create — ticket form
│   │   │   └── TicketDetail.jsx  # /tickets/:id — detail + status + notes
│   │   ├── components/
│   │   │   ├── SearchBar.jsx     # Debounced search input
│   │   │   ├── StatusFilter.jsx  # All / Open / In Progress / Closed tabs
│   │   │   ├── StatusBadge.jsx   # Colored status pill
│   │   │   ├── TicketList.jsx    # Table on desktop, cards on mobile
│   │   │   └── Toast.jsx         # Notification popup
│   │   ├── api/
│   │   │   └── tickets.js        # Fetch wrapper for all 4 endpoints
│   │   ├── utils/
│   │   │   └── format.js         # Date formatter
│   │   ├── App.jsx               # Router + layout
│   │   ├── App.css               # All styles (responsive)
│   │   └── main.jsx              # React entry
│   ├── index.html
│   ├── vite.config.js            # Vite config (port 5173)
│   ├── vercel.json               # SPA rewrites for Vercel
│   ├── package.json
│   └── .env.example
│
├── Dockerfile                    # python:3.11-slim image
├── render.yaml                   # Render Blueprint (env: docker)
├── .gitignore                    # 54 rules
└── README.md                     # You're here
```

---

## Why I Chose What I Chose

| Choice | My Reasoning |
|---|---|
| **FastAPI** | Gives me auto Swagger UI, Pydantic validation out of the box, and minimal boilerplate |
| **SQLite** | Zero setup, file-based, perfect for a 2-table schema |
| **SQLAlchemy 2.x** | Pairs cleanly with FastAPI and handles the FK between tickets and notes nicely |
| **React + Vite** | Fast dev server, 178KB production build (57KB gzipped), no heavy framework overhead |
| **Plain CSS** | No dependencies to manage, easy to read, and the UI is small enough |
| **fetch (no axios)** | It's built into every browser — one less dependency to audit |
| **Docker** | Avoids the Python 3.14 / pydantic-core build failure I hit on Render's default builder |

---

## Database Schema

### `tickets`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Primary key, auto-increment |
| `ticket_id` | TEXT | Unique, format `TKT-XXX` |
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

| Param | Type | Description |
|---|---|---|
| `status` | string (optional) | `Open` / `In Progress` / `Closed` |
| `search` | string (optional) | Case-insensitive match across ticket_id, name, email, subject, description |

Results are ordered by `created_at` descending (newest first).

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

Both `status` and `notes` are optional. If `notes` is non-empty, I insert a new row in the `notes` table. `updated_at` gets bumped whenever anything changes.

**Response 200**
```json
{ "success": true, "updated_at": "2026-06-01T20:27:46.220132" }
```

### Error Responses

| Status | When You'll See It |
|---|---|
| 400 | Invalid status (not Open/In Progress/Closed) |
| 404 | Ticket ID doesn't exist |
| 422 | Missing or invalid request fields |

---

## Frontend Views

| Route | What You See | What You Can Do |
|---|---|---|
| `/` | Dashboard | Search (debounced 300ms), filter tabs (All/Open/In Progress/Closed), ticket list — table on desktop, cards below 720px |
| `/create` | Create Ticket | Fill in 4 fields; I validate client-side and show server errors; redirects to the new ticket on success |
| `/tickets/:id` | Ticket Detail | See everything about a ticket; change status (auto-saves immediately); read and add notes; toast pops up on changes |
| `*` | 404 page | You hit a route that doesn't exist |

---

## Running It Locally

### What You'll Need

- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt

copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

uvicorn main:app --reload --port 8000
```

Open Swagger UI → http://127.0.0.1:8000/docs

### 2. Seed Some Demo Data (Optional)

With the venv active and the server **stopped**:

```bash
cd backend
python seed.py
```

This creates 6 realistic tickets (Emily Chen, Marcus Rivera, Priya Sharma, and three more) with notes and varying statuses spread across the last 3 days.

### 3. Frontend

```bash
cd frontend
npm install

copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

npm run dev
```

Open the app → http://127.0.0.1:5173

### 4. Or Run the Backend in Docker

```bash
docker build -t support-crm-api .
docker run -p 8000:8000 support-crm-api
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | What It Does |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./support.db` | SQLAlchemy connection string |
| `FRONTEND_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated CORS allow-list |

### Frontend (`frontend/.env`)

| Variable | Default | What It Does |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000` | Base URL for the FastAPI backend |

> **Note:** Vite bakes `VITE_API_URL` into the frontend **at build time**, not at runtime. If you change the backend URL after building, you need to rebuild and redeploy the frontend.

---

## Deployment

### Backend → Render (via Docker)

1. Push the repo to GitHub.
2. In Render Dashboard → **New Blueprint** → Connect your repo.
3. Render reads `render.yaml` and deploys using the `Dockerfile`.
4. Set `FRONTEND_ORIGIN` in Render's env vars to your deployed Vercel URL.

Or create a **Web Service** manually:
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile`
- **Health Check Path:** `/health`

> The Dockerfile uses `python:3.11-slim` for a consistent runtime environment.

### Frontend → Vercel

1. Vercel Dashboard → **Add New Project** → Import your GitHub repo.
2. **Root Directory:** `frontend/`
3. **Framework Preset:** Vite
4. **Environment Variables:** `VITE_API_URL` = your deployed Render backend URL.
5. Deploy. My `vercel.json` handles SPA rewrites so all routes work on refresh.

### Don't Forget CORS

After deploying the frontend, update the backend's `FRONTEND_ORIGIN` env var in Render to your Vercel URL, then trigger a manual deploy.

---

## Testing

### Backend (pytest — 41 tests)

```bash
cd backend
.venv\Scripts\activate
pytest
```

I wrote 41 tests covering all endpoints, edge cases (invalid status, missing fields, 404s), and validation.

### Frontend (build check)

```bash
cd frontend
npm run build
npx vite preview
```

Production build: 178KB JS (57KB gzipped), zero warnings.

---
