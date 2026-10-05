from fastapi import FastAPI

from app.users.router import router as users_router
from app.tickets.router import router as tickets_router
from app.comments.router import router as comments_router

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Helpdesk System API is running"}


app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(tickets_router, prefix="/tickets", tags=["Tickets"])
app.include_router(comments_router, prefix="/tickets", tags=["Comments"])
