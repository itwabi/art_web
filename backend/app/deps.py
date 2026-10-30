from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User


def get_current_user(db: Session = Depends(get_db)) -> User:
    user = db.scalars(select(User).order_by(User.id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден. Запустите: python -m app.seed")
    return user
