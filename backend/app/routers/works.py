from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.media import MAX_UPLOAD_BYTES, delete_work_file, detect_image_ext, save_work_file, work_url
from app.models import ChallengeTopic, User, UserChallenge, Work
from app.schemas import WorkOut

router = APIRouter(prefix="/me/works", tags=["works"])


def to_out(w: Work) -> WorkOut:
    return WorkOut(
        id=w.id,
        url=work_url(w.user_id, w.file_name),
        source=w.source,
        created_at=w.created_at,
        challenge_id=w.challenge_id,
        challenge_title=w.challenge.title if w.challenge else None,
        topic_id=w.topic_id,
        topic_title=w.topic.title if w.topic else None,
    )


@router.get("", response_model=list[WorkOut])
def my_works(
    challenge_id: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = select(Work).where(Work.user_id == user.id).order_by(Work.id.desc())
    if challenge_id:
        query = query.where(Work.challenge_id == challenge_id)
    return [to_out(w) for w in db.scalars(query)]


@router.post("", response_model=WorkOut, status_code=201)
def upload_work(
    file: UploadFile = File(...),
    challenge_id: str | None = Form(None),
    topic_id: int | None = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Загрузка фото. Без challenge_id/topic_id — просто в «Ваши работы» (после тренировки),
    с ними — к теме челленджа (нужно участвовать в челлендже)."""
    topic = None
    if challenge_id or topic_id:
        if not (challenge_id and topic_id):
            raise HTTPException(status_code=422, detail="Укажите и челлендж, и тему")
        topic = db.get(ChallengeTopic, topic_id)
        if topic is None or topic.challenge_id != challenge_id:
            raise HTTPException(status_code=404, detail="Тема не найдена")
        if db.get(UserChallenge, (user.id, challenge_id)) is None:
            raise HTTPException(status_code=403, detail="Сначала нажмите «Участвовать» в этом челлендже")

    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Файл больше 10 МБ")
    ext = detect_image_ext(data)
    if ext is None:
        raise HTTPException(status_code=400, detail="Поддерживаются только изображения JPG, PNG, WEBP и GIF")

    replaced: list[str] = []
    if topic:
        for old in db.scalars(select(Work).where(Work.user_id == user.id, Work.topic_id == topic.id)):
            replaced.append(old.file_name)
            db.delete(old)

    work = Work(
        user_id=user.id,
        file_name=save_work_file(user.id, data, ext),
        source="challenge" if topic else "sketch",
        challenge_id=topic.challenge_id if topic else None,
        topic_id=topic.id if topic else None,
    )
    db.add(work)
    db.commit()
    db.refresh(work)
    for name in replaced:
        delete_work_file(user.id, name)
    return to_out(work)


@router.delete("/{work_id}", status_code=204)
def delete_work(work_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    work = db.get(Work, work_id)
    if work is None or work.user_id != user.id:
        raise HTTPException(status_code=404, detail="Работа не найдена")
    file_name = work.file_name
    db.delete(work)
    db.commit()
    delete_work_file(user.id, file_name)
    return Response(status_code=204)
