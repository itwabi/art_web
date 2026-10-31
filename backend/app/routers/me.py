from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Challenge, SavedGeneration, User, UserChallenge
from app.routers.challenges import to_short
from app.schemas import ChallengeShort, GenerationIn, GenerationOut, ProfileOut

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=ProfileOut)
def get_profile(user: User = Depends(get_current_user)):
    return ProfileOut(nickname=user.nickname, streak_days=user.streak_days)


@router.get("/challenges", response_model=list[ChallengeShort])
def my_challenges(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = (
        select(Challenge)
        .join(UserChallenge, UserChallenge.challenge_id == Challenge.id)
        .where(UserChallenge.user_id == user.id)
        .order_by(UserChallenge.joined_at, Challenge.position)
    )
    return [to_short(c) for c in db.scalars(query)]


@router.post("/challenges/{challenge_id}", status_code=204)
def join_challenge(challenge_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if db.get(Challenge, challenge_id) is None:
        raise HTTPException(status_code=404, detail="Челлендж не найден")
    if db.get(UserChallenge, (user.id, challenge_id)) is None:
        db.add(UserChallenge(user_id=user.id, challenge_id=challenge_id))
        db.commit()
    return Response(status_code=204)


@router.delete("/challenges/{challenge_id}", status_code=204)
def leave_challenge(challenge_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    link = db.get(UserChallenge, (user.id, challenge_id))
    if link is not None:
        db.delete(link)
        db.commit()
    return Response(status_code=204)


@router.get("/generations", response_model=list[GenerationOut])
def my_generations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = select(SavedGeneration).where(SavedGeneration.user_id == user.id).order_by(SavedGeneration.id)
    return list(db.scalars(query))


@router.post("/generations", response_model=GenerationOut, status_code=201)
def save_generation(data: GenerationIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    title = data.title.strip()[:100] or "Генерация"
    row = SavedGeneration(
        user_id=user.id,
        title=title,
        theme=data.theme[:200],
        idea=data.idea[:300],
        palette=data.palette[:10],
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/generations/{generation_id}", status_code=204)
def delete_generation(generation_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.get(SavedGeneration, generation_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Генерация не найдена")
    db.delete(row)
    db.commit()
    return Response(status_code=204)
