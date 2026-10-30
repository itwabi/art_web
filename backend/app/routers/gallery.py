import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.media import MAX_UPLOAD_BYTES, delete_work_file, detect_image_ext, save_work_file, work_url
from app.models import User, Work
from app.schemas import GalleryImage, GalleryItem

router = APIRouter(prefix="/me/gallery", tags=["gallery"])

MAX_ALBUM_FILES = 20
SKETCH_TITLE = "Тренировка"
SKETCH_TAG = "Наброски"


def group_of(db: Session, user: User, work: Work) -> list[Work]:
    if not work.album_id:
        return [work]
    query = select(Work).where(Work.user_id == user.id, Work.album_id == work.album_id).order_by(Work.id)
    return list(db.scalars(query))


def to_item(works: list[Work]) -> GalleryItem:
    first = works[0]
    if first.challenge_id:
        kind = "challenge"
        title = first.topic.title if first.topic else first.challenge.title
        tags = [first.challenge.title] + ([first.topic.title] if first.topic else [])
    else:
        kind = "sketch"
        title = SKETCH_TITLE
        tags = list(first.categories or []) or [SKETCH_TAG]
    return GalleryItem(
        id=first.id,
        kind=kind,
        title=title,
        tags=tags,
        date=f"{first.created_at:%d.%m.%Y}",
        images=[GalleryImage(id=w.id, url=work_url(w.user_id, w.file_name)) for w in works],
    )


def build_items(works: list[Work]) -> list[GalleryItem]:
    groups: dict[str, list[Work]] = {}
    order: list[list[Work]] = []
    for w in works:
        if w.album_id:
            if w.album_id not in groups:
                groups[w.album_id] = []
                order.append(groups[w.album_id])
            groups[w.album_id].append(w)
        else:
            order.append([w])
    return [to_item(sorted(g, key=lambda w: w.id)) for g in order]


@router.get("", response_model=list[GalleryItem])
def my_gallery(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    works = db.scalars(select(Work).where(Work.user_id == user.id).order_by(Work.id.desc()))
    return build_items(list(works))


@router.get("/{item_id}", response_model=GalleryItem)
def get_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    work = db.get(Work, item_id)
    if work is None or work.user_id != user.id:
        raise HTTPException(status_code=404, detail="Работа не найдена")
    return to_item(group_of(db, user, work))


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    work = db.get(Work, item_id)
    if work is None or work.user_id != user.id:
        raise HTTPException(status_code=404, detail="Работа не найдена")
    works = group_of(db, user, work)
    names = [w.file_name for w in works]
    for w in works:
        db.delete(w)
    db.commit()
    for name in names:
        delete_work_file(user.id, name)
    return Response(status_code=204)


@router.post("", response_model=GalleryItem, status_code=201)
def upload_album(
    files: list[UploadFile] = File(...),
    categories: str | None = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(status_code=422, detail="Выберите хотя бы одно фото")
    if len(files) > MAX_ALBUM_FILES:
        raise HTTPException(status_code=422, detail=f"За один раз можно прикрепить не больше {MAX_ALBUM_FILES} фото")

    prepared: list[tuple[bytes, str]] = []
    for f in files:
        data = f.file.read(MAX_UPLOAD_BYTES + 1)
        if len(data) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail=f"Файл «{f.filename}» больше 10 МБ")
        ext = detect_image_ext(data)
        if ext is None:
            raise HTTPException(status_code=400, detail=f"Файл «{f.filename}» не подходит: поддерживаются JPG, PNG, WEBP и GIF")
        prepared.append((data, ext))

    cats = [c.strip() for c in (categories or "").split(",") if c.strip()][:10]
    album_id = uuid.uuid4().hex if len(prepared) > 1 else None
    works = [
        Work(user_id=user.id, file_name=save_work_file(user.id, data, ext), source="sketch", album_id=album_id, categories=cats)
        for data, ext in prepared
    ]
    db.add_all(works)
    db.commit()
    for w in works:
        db.refresh(w)
    return to_item(works)
