from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Ticket


def generate_ticket_id(db: Session, max_attempts: int = 5) -> str:
    """
    Generate a unique TKT-XXX id (3-digit zero-padded) by counting existing
    rows and retrying on collision to handle race conditions.
    """
    for _ in range(max_attempts):
        count = db.query(func.count(Ticket.id)).scalar() or 0
        candidate = f"TKT-{count + 1:03d}"

        exists = db.query(Ticket).filter(Ticket.ticket_id == candidate).first()
        if not exists:
            return candidate

        last_id = (
            db.query(Ticket.ticket_id)
            .order_by(Ticket.id.desc())
            .first()
        )
        if last_id and last_id[0].startswith("TKT-"):
            try:
                n = int(last_id[0].split("-")[1])
                candidate = f"TKT-{n + 1:03d}"
                exists = (
                    db.query(Ticket)
                    .filter(Ticket.ticket_id == candidate)
                    .first()
                )
                if not exists:
                    return candidate
            except (ValueError, IndexError):
                pass

    raise RuntimeError("Could not generate a unique ticket id after several attempts")
