from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
from models import Ticket, Note
from ticket_id_gen import generate_ticket_id

Base.metadata.create_all(bind=engine)

db = SessionLocal()

TICKETS = [
    {
        "customer_name": "Emily Chen",
        "customer_email": "emily.chen@acmecorp.com",
        "subject": "Cannot access admin dashboard",
        "description": "After the latest update on Monday, I keep getting a 403 Forbidden error when trying to access the admin panel at /admin/dashboard. I've cleared my cache and tried three different browsers. My role is 'Admin' in the system.",
    },
    {
        "customer_name": "Marcus Rivera",
        "customer_email": "marcus.r@startup.io",
        "subject": "Invoice #INV-2024-0891 has wrong total",
        "description": "The invoice for our Enterprise plan shows $2,400 but our contract signed in March states $1,800/month. The discrepancy started this billing cycle. I've attached the signed contract to this ticket.",
    },
    {
        "customer_name": "Priya Sharma",
        "customer_email": "priya.sharma@designlab.dev",
        "subject": "Feature request: Dark mode for reporting suite",
        "description": "Our team works late hours and the bright white reporting screens are causing eye strain. Would love a dark mode toggle similar to what you have in the main dashboard. Happy to beta test.",
    },
    {
        "customer_name": "James O'Brien",
        "customer_email": "james@obrienconsulting.com",
        "subject": "Password reset emails not arriving",
        "description": "I've requested a password reset three times (at 9AM, 12PM, and 3PM today) but none of the emails have arrived. I've checked spam. My email is james@obrienconsulting.com. Can you manually trigger one?",
    },
    {
        "customer_name": "Aisha Patel",
        "customer_email": "aisha@healthplus.org",
        "subject": "API rate limit too restrictive for batch processing",
        "description": "We're running nightly batch syncs for 50,000 patient records and hitting the 100 req/min limit within 2 minutes. Can we get a temporary increase to 500 req/min for the next 2 weeks while we optimize our sync logic?",
    },
    {
        "customer_name": "Tom Hardy",
        "customer_email": "tom.hardy@freelance.io",
        "subject": "Billing question: Annual plan discount not applied",
        "description": "I upgraded from Monthly ($29/mo) to Annual ($290/yr) yesterday but the system charged me $348 — it didn't apply the annual discount. My account email is tom.hardy@freelance.io. Receipt ID: RCP-2024-4432.",
    },
]

NOTES = [
    # Notes for ticket 0 (Emily)
    [
        "Checked the role permissions table. Emily's role 'Admin' correctly maps to the admin_dashboard permission. Could be a session token issue. Asked her to log out completely and log back in.",
        "Emily confirmed that logging out and back in fixed the issue. Closing ticket. Root cause was a stale session token from the update.",
    ],
    # Notes for ticket 1 (Marcus)
    [
        "Comparing the invoice line items against the signed contract. The Enterprise plan base price is correct ($1,800), but there's an additional $600 processor fee that wasn't supposed to be applied. Escalating to billing team.",
    ],
    # Notes for ticket 2 (Priya)
    [],
    # Notes for ticket 3 (James)
    [
        "Checked the email logs on SendGrid. The password reset emails are being sent successfully with status 'delivered'. Could be a recipient-side filter. Asked James to check with his IT team.",
    ],
    # Notes for ticket 4 (Aisha)
    [
        "Reviewed the API usage analytics. Aisha's account has been averaging 80 req/min for the past month. Spoke with the engineering team — we can temporarily increase the limit to 300 req/min. Applied the override.",
        "Aisha confirmed the increased rate limit is working. The batch job now completes in ~3 minutes. We'll keep monitoring and optimize the sync logic.",
    ],
    # Notes for ticket 5 (Tom)
    [],
]

STATUSES = [
    "Closed",       # Emily
    "In Progress",  # Marcus
    "Open",         # Priya
    "In Progress",  # James
    "In Progress",  # Aisha
    "Open",         # Tom
]

# Spread created_at across the last 3 days so the list looks realistic
now = datetime.utcnow()

try:
    for i, data in enumerate(TICKETS):
        ticket_id = generate_ticket_id(db)
        created_at = now - timedelta(
            hours=len(TICKETS) * 6 - i * 6,
            minutes=i * 13,
        )

        ticket = Ticket(
            ticket_id=ticket_id,
            customer_name=data["customer_name"],
            customer_email=data["customer_email"],
            subject=data["subject"],
            description=data["description"],
            status=STATUSES[i],
            created_at=created_at,
            updated_at=created_at,
        )
        db.add(ticket)
        db.flush()

        for j, note_text in enumerate(NOTES[i]):
            note = Note(
                ticket_id=ticket.ticket_id,
                note_text=note_text,
                created_at=created_at + timedelta(minutes=(j + 1) * 15),
            )
            db.add(note)

        print(f"  {ticket_id} — {data['customer_name']:20s} [{STATUSES[i]:13s}] {data['subject']}")

    db.commit()
    print(f"\n✅ Seeded {len(TICKETS)} tickets with notes into the database.")
    print("   Open http://127.0.0.1:5173 to see them in the dashboard.")

except Exception as e:
    db.rollback()
    print(f"\n❌ Error: {e}")

finally:
    db.close()
