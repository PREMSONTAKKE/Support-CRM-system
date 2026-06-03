# Support CRM — Datastraw AI + Tech Intern Assessment

A lightweight, full-stack ticket management system built for the Datastraw assessment.

- **Backend:** FastAPI + SQLAlchemy + SQLite
- **Frontend:** React 18 + Vite + React Router v6
- **Database:** 2 tables (`tickets`, `notes`) — no mocks, all live data
- **API:** exactly 4 endpoints, no more, no less

---

## Live URLs (after deployment)

| Layer    | URL (fill in after deploy)                       |
| -------- | ------------------------------------------------ |
| Frontend | `https://your-app.vercel.app`                    |
| Backend  | `https://your-api.onrender.com`                  |
| API Docs | `https://your-api.onrender.com/docs` (Swagger)   |

---

## Project Structure

```
support-crm/
├── backend/
│   ├── main.py              # FastAPI app + 4 endpoints + CORS
│   ├── database.py          # SQLite engine, SessionLocal, Base
│   ├── models.py            # SQLAlchemy models (tickets, notes)
│   ├── schemas.py           # Pydantic request/response models
│   ├── ticket_id_gen.py     # TKT-XXX id generator
│   ├── requirements.txt
│   ├── runtime.txt          # Python version (for Render)
│   ├── Procfile             # Start command (for Render/Railway)
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── api/tickets.js
│       ├── utils/format.js
│       ├── components/
│       │   ├── SearchBar.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── StatusFilter.jsx
│       │   ├── TicketList.jsx
│       │   └── Toast.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── CreateTicket.jsx
│           └── TicketDetail.jsx
├── .gitignore
└── README.md
```

---

## Tech Choices & Why

| Choice | Reason |
| --- | --- |
| **FastAPI** | Auto Swagger UI, async-ready, Pydantic validation out of the box, minimal boilerplate. |
| **SQLite** | File-based, zero infrastructure, fits a 2-table schema. The spec emphasizes simplicity. |
| **SQLAlchemy 2.x** | First-class FastAPI pairing; cleanly models the FK relationship between `tickets` and `notes`. |
| **React + Vite** | Fast dev server, modern build, tiny output. No need for heavier CRA / Next. |
| **Plain CSS** | Single dependency, easy to read, no framework lock-in. The UI is small. |
| **`fetch` (no axios)** | Built into the browser, one less dep to vet. |

---

## Database Schema

### `tickets`
| Column           | Type     | Notes                                   |
| ---------------- | -------- | --------------------------------------- |
| `id`             | INTEGER  | Primary key                             |
| `ticket_id`      | TEXT     | Unique, format `TKT-XXX` (3-digit)      |
| `customer_name`  | TEXT     | Required                                |
| `customer_email` | TEXT     | Required                                |
| `subject`        | TEXT     | Required                                |
| `description`    | TEXT     | Required                                |
| `status`         | TEXT     | `Open` / `In Progress` / `Closed`       |
| `created_at`     | DATETIME | Auto-set on create                      |
| `updated_at`     | DATETIME | Auto-bumped on any update               |

### `notes`
| Column      | Type     | Notes                                          |
| ----------- | -------- | ---------------------------------------------- |
| `id`        | INTEGER  | Primary key                                    |
| `ticket_id` | TEXT     | FK → `tickets.ticket_id`                       |
| `note_text` | TEXT     | Required                                       |
| `created_at`| DATETIME | Auto-set on insert                             |

---

## API Reference (4 Endpoints)

### 1. Create Ticket
```http
POST /api/tickets
Content-Type: application/json

{
  "customer_name": "Alice Johnson",
  "customer_email": "alice@example.com",
  "subject": "Login not working",
  "description": "Cannot reach the dashboard."
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
- `status` (optional): `Open` | `In Progress` | `Closed`
- `search` (optional): matches against `ticket_id`, `customer_name`, `customer_email`, `subject`, `description` (case-insensitive)
- Results ordered by `created_at` descending.

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
  "description": "Cannot reach the dashboard.",
  "status": "In Progress",
  "created_at": "2026-06-01T20:27:42.385821",
  "updated_at": "2026-06-01T20:27:46.220132",
  "notes": [
    { "note_text": "Investigating login flow.", "created_at": "..." }
  ]
}
```

### 4. Update Ticket & Add Note
```http
PUT /api/tickets/TKT-001
Content-Type: application/json

{
  "status": "In Progress",
  "notes": "Investigating login flow."
}
```
Both `status` and `notes` are optional. If `notes` is non-empty, a row is inserted into `notes`. `updated_at` is bumped whenever anything changes.

**Response 200**
```json
{ "success": true, "updated_at": "2026-06-01T20:27:46.220132" }
```

---

## Frontend Views

| Route               | View                  | Features                                                                  |
| ------------------- | --------------------- | ------------------------------------------------------------------------- |
| `/`                 | Dashboard             | Search (debounced 300ms), status filter tabs, ticket table (cards on mobile) |
| `/create`           | Create Ticket         | 4-field form, client-side validation, server error surfacing              |
| `/tickets/:id`      | Ticket Detail         | Full info, status dropdown (auto-save on change), notes list + add-note   |

Mobile responsive: table collapses to stacked cards under 720px.

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

uvicorn main:app --reload --port 8000
```

Swagger UI → <http://127.0.0.1:8000/docs>

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

npm run dev
```

App → <http://127.0.0.1:5173>

---

## Environment Variables

| Var (backend)        | Default                              | Purpose                                      |
| -------------------- | ------------------------------------ | -------------------------------------------- |
| `DATABASE_URL`       | `sqlite:///./support.db`             | SQLAlchemy connection string                 |
| `FRONTEND_ORIGIN`    | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated CORS allow-list    |

| Var (frontend)       | Default                  | Purpose                              |
| -------------------- | ------------------------ | ------------------------------------ |
| `VITE_API_URL`       | `http://127.0.0.1:8000`  | Base URL for the FastAPI backend     |

> `VITE_API_URL` is the production override. Set it to the deployed backend URL when you build the frontend.

---

## Deployment

### Backend → Render.com (or Railway.app)

1. Create a new **Web Service** from this repo, root = `backend/`.
2. **Build command:** `pip install -r requirements.txt`
3. **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set env vars: `DATABASE_URL`, `FRONTEND_ORIGIN` (the deployed frontend URL).
5. **Important:** SQLite is a single file. For a real production app, swap to Postgres. For this assessment, the on-disk SQLite is sufficient — Render mounts a persistent disk if you enable it, or you can use a free Postgres add-on.

### Frontend → Vercel

1. Import the repo in Vercel, **Root Directory** = `frontend/`.
2. Framework preset: **Vite**.
3. Add env var: `VITE_API_URL` = your deployed backend URL.
4. Deploy. The `vercel.json` handles SPA rewrites so React Router routes work on refresh.

---

## Verification Checklist (Spec Compliance)

- [x] 2 tables exactly (`tickets`, `notes`)
- [x] 4 endpoints exactly
- [x] `ticket_id` auto-generated as `TKT-XXX`
- [x] `created_at` / `updated_at` auto-managed
- [x] Search matches names, IDs, emails, descriptions (+subject bonus)
- [x] Status filter supports all 3 values
- [x] Live database — no mocks anywhere
- [x] Mobile-responsive frontend
- [x] CORS configured
- [x] Backend CORS allows the frontend origin(s)
- [x] `.gitignore` excludes `node_modules/`, `.venv/`, `*.db`, `.env`
- [x] `.env.example` provided for both layers
- [x] `README.md` with setup instructions

---

## What I'd Add With More Time

- User authentication (Auth0 or simple JWT) and per-agent ticket assignment.
- PostgreSQL for production durability (SQLite is fine for a demo).
- Pagination on the list endpoint (currently unbounded).
- File attachments on tickets.
- Real-time updates via WebSockets (so multiple agents see new notes live).
- Optimistic updates with React Query and a rollback on error.
- E2E tests with Playwright + unit tests with pytest/Vitest.
