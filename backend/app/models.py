from datetime import date, datetime

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nickname: Mapped[str] = mapped_column(String(50))
    streak_days: Mapped[int] = mapped_column(Integer, default=0)


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    kind: Mapped[str] = mapped_column(String(20), index=True)
    title: Mapped[str] = mapped_column(String(100))
    date_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, default=0)

    topics: Mapped[list["ChallengeTopic"]] = relationship(
        order_by="ChallengeTopic.position",
        cascade="all, delete-orphan",
    )


class ChallengeTopic(Base):
    __tablename__ = "challenge_topics"

    id: Mapped[int] = mapped_column(primary_key=True)
    challenge_id: Mapped[str] = mapped_column(ForeignKey("challenges.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))


class UserChallenge(Base):
    __tablename__ = "user_challenges"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    challenge_id: Mapped[str] = mapped_column(ForeignKey("challenges.id", ondelete="CASCADE"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class SavedGeneration(Base):
    __tablename__ = "saved_generations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(100))
    theme: Mapped[str] = mapped_column(String(200))
    idea: Mapped[str] = mapped_column(String(300))
    palette: Mapped[list[str]] = mapped_column(JSON)


class Work(Base):
    """Фото рисунка. Сам файл лежит в media/works/<id пользователя>/, в базе — только имя файла."""

    __tablename__ = "works"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    file_name: Mapped[str] = mapped_column(String(100))
    source: Mapped[str] = mapped_column(String(20), default="sketch")  # sketch — после тренировки, challenge — к теме челленджа
    challenge_id: Mapped[str | None] = mapped_column(ForeignKey("challenges.id", ondelete="SET NULL"), nullable=True, index=True)
    topic_id: Mapped[int | None] = mapped_column(ForeignKey("challenge_topics.id", ondelete="SET NULL"), nullable=True, index=True)
    album_id: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    categories: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    challenge: Mapped[Challenge | None] = relationship()
    topic: Mapped[ChallengeTopic | None] = relationship()


class SketchCategory(Base):
    __tablename__ = "sketch_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    position: Mapped[int] = mapped_column(Integer, default=0)


class GeneratorItem(Base):
    __tablename__ = "generator_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(10), index=True)
    value: Mapped[str] = mapped_column(String(300))
