from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.media import list_reference_urls
from app.models import SketchCategory
from app.schemas import CategoryOut, IntOption, SketchDefaults, SketchOptionsOut, StrOption

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


# Варианты для выпадающих списков на странице настройки тренировки
TIMES = [(60, "1 минута"), (180, "3 минуты"), (300, "5 минут")]
COUNTS = [5, 10, 15, 20, 25, 30]
ORDERS = [("random", "Случайный"), ("ordered", "По порядку выбора")]


@router.get("/options", response_model=SketchOptionsOut)
def sketch_options():
    return SketchOptionsOut(
        times=[IntOption(value=v, label=label) for v, label in TIMES],
        counts=[IntOption(value=n, label=f"{n} набросков") for n in COUNTS],
        orders=[StrOption(value=v, label=label) for v, label in ORDERS],
        defaults=SketchDefaults(seconds=60, count=10, order="random"),
    )
