from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, Work


def calculate_streak_from_dates(activity_dates: set[date], today: date | None = None) -> int:
    today = today or date.today()
    if not activity_dates:
        return 0

    last_activity = max(activity_dates)
    if last_activity < today - timedelta(days=1):
        return 0

    cursor = today if today in activity_dates else today - timedelta(days=1)
    streak = 0
    while cursor in activity_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def update_user_streak(db: Session, user: User, today: date | None = None) -> int:
    timestamps = db.scalars(
        select(Work.created_at).where(Work.user_id == user.id)
    )
    activity_dates = {
        timestamp.date()
        for timestamp in timestamps
        if timestamp is not None
    }
    streak = calculate_streak_from_dates(activity_dates, today=today)
    if user.streak_days != streak:
        user.streak_days = streak
        db.commit()
    return streak
