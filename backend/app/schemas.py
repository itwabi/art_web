from pydantic import BaseModel


class ChallengeShort(BaseModel):
    id: str
    kind: str
    title: str
    dates: str | None = None


class ChallengeDetail(ChallengeShort):
    description: str
    topics: list[str]


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
    color: str


class CategoryOut(BaseModel):
    id: int
    name: str


class GenerateOut(BaseModel):
    theme: str | None = None
    idea: str | None = None
    palette: list[str] | None = None
