from datetime import datetime

from pydantic import BaseModel


class ChallengeShort(BaseModel):
    id: str
    kind: str
    title: str
    dates: str | None = None


class TopicOut(BaseModel):
    id: int
    title: str


class ChallengeDetail(ChallengeShort):
    description: str
    topics: list[TopicOut]


class ProfileOut(BaseModel):
    nickname: str
    streak_days: int


class GenerationOut(BaseModel):
    id: int
    title: str
    theme: str
    idea: str
    palette: list[str]


class WorkOut(BaseModel):
    id: int
    url: str
    source: str
    created_at: datetime
    challenge_id: str | None = None
    challenge_title: str | None = None
    topic_id: int | None = None
    topic_title: str | None = None


class GalleryImage(BaseModel):
    id: int
    url: str


class GalleryItem(BaseModel):
    """Карточка галереи: одно фото или альбом из нескольких фото одной тренировки."""

    id: int
    kind: str  # sketch | challenge
    title: str
    tags: list[str]
    date: str
    images: list[GalleryImage]


class CategoryOut(BaseModel):
    id: int
    name: str


class GenerateOut(BaseModel):
    theme: str | None = None
    idea: str | None = None
    palette: list[str] | None = None


class IntOption(BaseModel):
    value: int
    label: str


class StrOption(BaseModel):
    value: str
    label: str


class SketchDefaults(BaseModel):
    seconds: int
    count: int
    order: str


class SketchOptionsOut(BaseModel):
    times: list[IntOption]
    counts: list[IntOption]
    orders: list[StrOption]
    defaults: SketchDefaults
