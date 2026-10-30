from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Challenge
from app.schemas import ChallengeDetail, ChallengeShort

router = APIRouter(prefix="/challenges", tags=["challenges"])


def dates_label(c: Challenge) -> str | None:
    if c.date_start and c.date_end:
        return f"{c.date_start:%d.%m.%Y} – {c.date_end:%d.%m.%Y}"
    return None


def to_short(c: Challenge) -> ChallengeShort:
    return ChallengeShort(id=c.id, kind=c.kind, title=c.title, dates=dates_label(c))


def to_detail(c: Challenge) -> ChallengeDetail:
    return ChallengeDetail(
        id=c.id,
        kind=c.kind,
        title=c.title,
        dates=dates_label(c),
        description=c.description,
        topics=[t.title for t in c.topics],
    )


@router.get("", response_model=list[ChallengeShort])
def list_challenges(kind: Literal["calendar", "permanent"] | None = None, db: Session = Depends(get_db)):
    query = select(Challenge).order_by(Challenge.position)
    if kind:
        query = query.where(Challenge.kind == kind)
    return [to_short(c) for c in db.scalars(query)]


@router.get("/{challenge_id}", response_model=ChallengeDetail)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Челлендж не найден")
    return to_detail(challenge)
