from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuthToken, User
from app.security import hash_token


def bearer_token(authorization: str | None) -> str | None:
    scheme, _, token = (authorization or "").partition(" ")
    token = token.strip()
    if scheme.lower() != "bearer" or not token:
        return None
    return token


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    headers = {"WWW-Authenticate": "Bearer"}
    token = bearer_token(authorization)
    if token is None:
        raise HTTPException(status_code=401, detail="Войдите в аккаунт, чтобы продолжить", headers=headers)
    row = db.get(AuthToken, hash_token(token))
    user = db.get(User, row.user_id) if row else None
    if user is None:
        raise HTTPException(status_code=401, detail="Сессия истекла. Войдите в аккаунт снова", headers=headers)
    return user
