# Demo Video Script (3-5 minutes)

Record your screen and voice. Show the live app, walk through the code briefly, explain your choices, and mention a challenge. Keep it conversational — don't read this verbatim.

---

## 0:00 – 0:30 — Intro + Live App

> *"Hi, I'm [name]. This is the Support CRM I built for the Datastraw assessment."*

- Open the **live frontend URL** in your browser
- If you seeded the DB, show 6 tickets in the dashboard list
- If not seeded, show empty state → create 2 tickets quickly

**Talking points:**
- Full-stack app: React frontend → FastAPI backend → SQLite database
- Deployed on Vercel (frontend) + Render (backend via Docker)

---

## 0:30 – 1:30 — Feature Walkthrough

### Create a ticket
- Click **"+ New Ticket"**
- Fill in: name, email, subject, description
- Click **"Create Ticket"** → auto-redirects to detail page
- **Point out:** The ticket ID (TKT-005) and timestamp were auto-generated — no user input for those

### Search
- Go back to dashboard, type in the search bar (e.g. "invoice")
- **Point out:** Results filter in real-time as you type (300ms debounce)

### Filter by status
- Click **"Closed"** tab — only closed tickets show
- Click **"All"** — back to full list

> *"That's the 5 core features: Create, List, Search, Filter, and View/Update."*

---

## 1:30 – 2:00 — Update a ticket + Add a note

- Click a ticket → detail page
- Change the **status dropdown** (e.g. Open → In Progress)
- **Point out:** A toast pops up "Status changed" — no save button needed
- Type a note in the textarea → **"Add Note"** → note appears immediately

> *"The status update is optimistic — the UI changes instantly and rolls back if the API fails."*

---

## 2:00 – 2:30 — Code walkthrough (show GitHub repo)

> *"Let me quickly walk through the project structure."*

Show the **GitHub repo page** in your browser:

```
├── backend/
│   ├── main.py          ← 4 API endpoints
│   ├── models.py        ← 2 tables (tickets, notes)
│   ├── schemas.py       ← request/response validation
│   └── seed.py          ← demo data script
├── frontend/
│   ├── src/pages/       ← Dashboard, CreateTicket, TicketDetail
│   └── src/api/         ← fetch wrapper, no external dependencies
```

**Highlight:**
- Only 2 tables (PDF says "keep it simple")
- Exactly 4 endpoints (PDF says "simple and sufficient")
- All data comes from a live database — no mocks

---

## 2:30 – 3:00 — Tech choices

> *"Why I chose what I chose:"*

| Choice | Why |
|---|---|
| **FastAPI (Python)** | Auto Swagger docs, Pydantic validation, minimal boilerplate |
| **SQLite** | Zero setup, fits a 2-table schema (PDF: "keep it simple") |
| **React + Vite** | Fast dev server, lightweight build (178 KB gzipped to 57 KB) |
| **Plain CSS** | No framework lock-in, easy to understand |
| **Docker deploy** | Avoids Python version issues on Render (Python 3.11 slim image) |

---

## 3:00 – 3:30 — Challenge you solved

Pick one of these depending on what actually happened during your build:

### Option A: "CORS between two domains"
> *"The frontend runs on one domain (Vercel) and the backend on another (Render). I had to configure CORS to allow cross-origin requests. The challenge was supporting both localhost (development) and the deployed URL (production) without hardcoding. I solved it with an environment variable `FRONTEND_ORIGIN` that accepts a comma-separated list of origins."*

### Option B: "Search working across multiple fields"
> *"The search needs to match ticket IDs, customer names, emails, and descriptions. I used SQLAlchemy's `or_` with `ilike` on all 5 fields (including subject as a bonus). The tricky part was making sure it's case-insensitive and doesn't break on partial matches."*

### Option C: "Debounced search without extra dependencies"
> *"The search bar filters results as you type — but firing an API call on every keystroke would be wasteful. I implemented a 300ms debounce using React's `useEffect` cleanup. No external library needed — just `setTimeout` and `clearTimeout`."*

---

## 3:30 – 4:00 — What I'd add with more time

> *"If I had another week:"*

1. **Authentication** — Basic login so each agent sees their assigned tickets
2. **PostgreSQL** — For production durability (SQLite resets on Render free deploys)
3. **Pagination** — Current list is unbounded; at scale you'd need page numbers
4. **Real-time updates** — WebSockets so multiple agents see new notes live
5. **E2E tests** — Playwright to automate the whole flow

> *"But per the PDF: 'Should I add fancy features? No. Focus on core features first.' So I kept it focused."*

---

## 4:00 – 4:30 — Wrap up

> *"You can find everything here:"*

Put these on screen:
- **Live App:** `https://support-crm.vercel.app`
- **GitHub:** `https://github.com/PREMSONTAKKE/Support-CRM-system`
- **API Docs (Swagger):** `https://support-crm-api.onrender.com/docs`

> *"Thanks for reviewing my submission. Happy to answer any questions."*

---

## Recording Tips

- **Tools:** OBS Studio (free), Loom, or QuickTime (Mac)
- **Audio:** Use a microphone — phone earbuds work fine
- **Reshoot if:** You stumble, the app hiccups, or you forget a step
- **Don't over-edit:** One take is fine. The evaluator wants to see you think, not a polished script
- **Total time:** 3-5 min. If you're over 5, trim the code walkthrough
