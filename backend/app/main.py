import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine
from app.media import MEDIA_DIR, ensure_reference_folders
from app.migrate import add_missing_columns
from app.models import SketchCategory
from app.routers import auth, challenges, gallery, generate, me, sketch, works


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    add_missing_columns(engine)
    with Session(engine) as db:
        ensure_reference_folders(list(db.scalars(select(SketchCategory.name))))
    yield


MEDIA_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Art Web API", lifespan=lifespan)


@app.middleware("http")
async def server_errors(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception:
        logging.getLogger("uvicorn.error").exception("Ошибка при обработке %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Ошибка на сервере. Подробности в консоли бэкенда"})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth.router, challenges.router, me.router, gallery.router, works.router, sketch.router, generate.router):
    app.include_router(router, prefix="/api")


app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")


@app.get("/api/health", tags=["service"])
def health():
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root():
    return {"message": "Art Web API работает", "docs": "/docs"}
