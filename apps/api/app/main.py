from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import Base, engine

import app.models

from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.workers import router as workers_router
from app.routers.availabilities import router as availabilities_router
from app.routers.jobs import router as jobs_router
from app.routers.worker_skills import router as worker_skills_router
from app.routers.matches import router as matches_router
from app.routers.applications import router as applications_router
from app.routers.worker_jobs import (
    router as worker_jobs_router
)
from app.routers.conversations import (
    router as conversations_router
)
from app.routers.reviews import (
    router as reviews_router    )  

from app.routers.notifications import (
    router as notifications_router
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(workers_router)
app.include_router(availabilities_router)
app.include_router(jobs_router)
app.include_router(worker_skills_router)
app.include_router(matches_router)
app.include_router(applications_router)
app.include_router(worker_jobs_router)
app.include_router(conversations_router)
app.include_router(reviews_router)
app.include_router(notifications_router)

@app.get("/")
def root():
    return {
        "message": "MainForte API running"
    }