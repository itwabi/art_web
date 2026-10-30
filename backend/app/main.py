from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine
from app.media import MEDIA_DIR, ensure_reference_folders
from app.models import SketchCategory
from app.routers import challenges, gallery, generate, me, sketch, works


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        ensure_reference_folders(list(db.scalars(select(SketchCategory.name))))
    yield


MEDIA_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Art Web API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (challenges.router, me.router, gallery.router, works.router, sketch.router, generate.router):
    app.include_router(router, prefix="/api")


app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")


@app.get("/api/health", tags=["service"])
def health():
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root():
    return {"message": "Art Web API работает", "docs": "/docs"}
