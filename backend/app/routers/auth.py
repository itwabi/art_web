from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import bearer_token
from app.models import AuthToken, User
from app.schemas import AuthRules, Credentials, TokenOut
from app.security import hash_password, hash_token, new_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

NICKNAME_MIN, NICKNAME_MAX = 2, 30
PASSWORD_MIN, PASSWORD_MAX = 6, 128


def find_user(db: Session, nickname: str) -> User | None:
    query = select(User).where(or_(User.nickname == nickname, func.lower(User.nickname) == nickname.lower()))
    return db.scalars(query).first()


def issue_token(db: Session, user: User) -> TokenOut:
    token = new_token()
    db.add(AuthToken(token_hash=hash_token(token), user_id=user.id))
    db.commit()
    return TokenOut(token=token, nickname=user.nickname)


@router.get("/rules", response_model=AuthRules)
def rules():
    return AuthRules(
        nickname_min=NICKNAME_MIN,
        nickname_max=NICKNAME_MAX,
        password_min=PASSWORD_MIN,
        password_max=PASSWORD_MAX,
    )


@router.post("/register", response_model=TokenOut, status_code=201)
def register(data: Credentials, db: Session = Depends(get_db)):
    nickname = data.nickname.strip()
    if not NICKNAME_MIN <= len(nickname) <= NICKNAME_MAX:
        raise HTTPException(status_code=422, detail=f"Никнейм должен быть от {NICKNAME_MIN} до {NICKNAME_MAX} символов")
    if not PASSWORD_MIN <= len(data.password) <= PASSWORD_MAX:
        raise HTTPException(status_code=422, detail=f"Пароль должен быть от {PASSWORD_MIN} до {PASSWORD_MAX} символов")
    if find_user(db, nickname) is not None:
        raise HTTPException(status_code=409, detail="Этот никнейм уже занят")

    user = User(nickname=nickname, password_hash=hash_password(data.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Этот никнейм уже занят")
    return issue_token(db, user)


@router.post("/login", response_model=TokenOut)
def login(data: Credentials, db: Session = Depends(get_db)):
    user = find_user(db, data.nickname.strip())
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный никнейм или пароль")
    return issue_token(db, user)


@router.post("/logout", status_code=204)
def logout(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    token = bearer_token(authorization)
    row = db.get(AuthToken, hash_token(token)) if token else None
    if row is not None:
        db.delete(row)
        db.commit()
    return Response(status_code=204)
