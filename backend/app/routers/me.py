from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Challenge, SavedGeneration, User, UserChallenge, Work
from app.routers.challenges import to_short
from app.schemas import ChallengeShort, GenerationOut, ProfileOut, WorkOut

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


@router.get("/works", response_model=list[WorkOut])
def my_works(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = select(Work).where(Work.user_id == user.id).order_by(Work.id)
    return list(db.scalars(query))
