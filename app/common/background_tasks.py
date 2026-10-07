from pathlib import Path

from sqlalchemy import select

from app.core.database import async_session_maker
from app.tickets.models import Ticket


SUMMARY_DIR = Path("ticket_summaries")


async def process_new_ticket(ticket_id: int):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Ticket).where(Ticket.id == ticket_id)
        )

        ticket = result.scalar_one_or_none()

        if ticket is None:
            return

        SUMMARY_DIR.mkdir(exist_ok=True)

        summary = f"""Ticket #{ticket.id} Summary
        Title: {ticket.title}
        Priority: {ticket.priority}
        Status: {ticket.status}
        Description:{ticket.description}"""

        file_path = SUMMARY_DIR / f"ticket_{ticket.id}.txt"

        file_path.write_text(summary)

        print(
            f"Background task: summary created for ticket {ticket.id}"
        )
