from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.media import list_reference_urls
from app.models import SketchCategory
from app.schemas import CategoryOut

router = APIRouter(prefix="/sketch", tags=["sketch"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return list(db.scalars(select(SketchCategory).order_by(SketchCategory.position)))


@router.get("/references", response_model=dict[str, list[str]])
def list_references(categories: str | None = None, db: Session = Depends(get_db)):
    names = list(db.scalars(select(SketchCategory.name).order_by(SketchCategory.position)))
    if categories:
        wanted = [c.strip() for c in categories.split(",") if c.strip()]
        names = [n for n in names if n in wanted]
    return {name: list_reference_urls(name) for name in names}
