import random

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GeneratorItem
from app.schemas import GenerateOut

router = APIRouter(prefix="/generate", tags=["generate"])


def pick(db: Session, kind: str, previous: str | None) -> str | None:
    values = list(db.scalars(select(GeneratorItem.value).where(GeneratorItem.kind == kind)))
    if previous and len(values) > 1:
        values = [v for v in values if v != previous]
    return random.choice(values) if values else None


@router.get("", response_model=GenerateOut)
def generate(
    theme: bool = True,
    idea: bool = True,
    palette: bool = True,
    prev_theme: str | None = None,
    prev_idea: str | None = None,
    prev_palette: str | None = None,
    db: Session = Depends(get_db),
):
    result = GenerateOut()
    if theme:
        result.theme = pick(db, "theme", prev_theme)
    if idea:
        result.idea = pick(db, "idea", prev_idea)
    if palette:
        colors = pick(db, "palette", prev_palette)
        result.palette = colors.split(",") if colors else None
    return result
