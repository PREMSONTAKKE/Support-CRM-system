import os
from datetime import datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Note, Ticket
from schemas import (
    CreateResponse,
    TicketCreate,
    TicketDetail,
    TicketListItem,
    TicketUpdate,
    UpdateResponse,
)
from ticket_id_gen import generate_ticket_id

load_dotenv()

Base.metadata.create_all(bind=engine)

ALLOWED_STATUSES = {"Open", "In Progress", "Closed"}


DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def _cors_origins() -> List[str]:
    raw = os.getenv("FRONTEND_ORIGIN")
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return DEFAULT_ORIGINS


app = FastAPI(
    title="Support CRM API",
    version="1.0.0",
    description="Support CRM — Ticket management API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"service": "Support CRM API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ---------- Endpoint 1: Create Ticket ----------
@app.post(
    "/api/tickets",
    response_model=CreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id(db)
    now = datetime.utcnow()
    ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=payload.customer_name.strip(),
        customer_email=payload.customer_email.strip(),
        subject=payload.subject.strip(),
        description=payload.description.strip(),
        status="Open",
        created_at=now,
        updated_at=now,
    )
    db.add(ticket)
    db.commit()
    return CreateResponse(ticket_id=ticket_id, created_at=now)


# ---------- Endpoint 2: List & Search Tickets ----------
@app.get("/api/tickets", response_model=List[TicketListItem])
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Ticket)

    if status_filter:
        if status_filter not in ALLOWED_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Allowed: {sorted(ALLOWED_STATUSES)}",
            )
        query = query.filter(Ticket.status == status_filter)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Ticket.ticket_id.ilike(term),
                Ticket.customer_name.ilike(term),
                Ticket.customer_email.ilike(term),
                Ticket.subject.ilike(term),
                Ticket.description.ilike(term),
            )
        )

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return tickets


# ---------- Endpoint 3: Get Ticket Details ----------
@app.get("/api/tickets/{ticket_id}", response_model=TicketDetail)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return ticket


# ---------- Endpoint 4: Update Ticket & Add Note ----------
@app.put("/api/tickets/{ticket_id}", response_model=UpdateResponse)
def update_ticket(
    ticket_id: str,
    payload: TicketUpdate,
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    updated = False

    if payload.status is not None:
        if payload.status not in ALLOWED_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Allowed: {sorted(ALLOWED_STATUSES)}",
            )
        if ticket.status != payload.status:
            ticket.status = payload.status
            updated = True

    if payload.notes is not None and payload.notes.strip():
        note = Note(
            ticket_id=ticket.ticket_id,
            note_text=payload.notes.strip(),
            created_at=datetime.utcnow(),
        )
        db.add(note)
        updated = True

    if updated:
        ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)
    return UpdateResponse(success=True, updated_at=ticket.updated_at)
