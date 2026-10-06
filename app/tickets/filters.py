from typing import Optional

from fastapi_filter.contrib.sqlalchemy import Filter

from app.tickets.models import Ticket
             

class TicketFilter(Filter):
    search: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    order_by: Optional[list[str]] = None

    class Constants(Filter.Constants):
        model = Ticket
        search_model_fields = [
            "title",
            "description",
        ]
