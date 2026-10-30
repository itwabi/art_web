import uuid
from pathlib import Path
from urllib.parse import quote

MEDIA_DIR = Path(__file__).resolve().parent.parent / "media"
REFERENCES_DIR = MEDIA_DIR / "references"
WORKS_DIR = MEDIA_DIR / "works"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 МБ на одно фото

README_TEXT = (
    "Сюда кладите фотографии-референсы для быстрых набросков.\n"
    "Каждая категория лежит в своей папке: папка называется так же, как категория.\n"
    "Подходят файлы .jpg, .jpeg, .png, .webp, .gif.\n"
)


def ensure_reference_folders(category_names: list[str]) -> None:
    REFERENCES_DIR.mkdir(parents=True, exist_ok=True)
    readme = REFERENCES_DIR / "README.txt"
    if not readme.exists():
        readme.write_text(README_TEXT, encoding="utf-8")
    for name in category_names:
        if Path(name).name != name:
            continue
        folder = REFERENCES_DIR / name
        folder.mkdir(exist_ok=True)
        keep = folder / ".gitkeep"
        if not keep.exists():
            keep.touch()


def list_reference_urls(category_name: str) -> list[str]:
    if Path(category_name).name != category_name:
        return []
    folder = REFERENCES_DIR / category_name
    if not folder.is_dir():
        return []
    files = sorted(
        f.name for f in folder.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    )
    return ["/media/references/" + quote(category_name) + "/" + quote(name) for name in files]


def detect_image_ext(data: bytes) -> str | None:
    """Определяет формат по первым байтам файла (а не по имени, которое можно подделать)."""
    if data.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None


def save_work_file(user_id: int, data: bytes, ext: str) -> str:
    folder = WORKS_DIR / str(user_id)
    folder.mkdir(parents=True, exist_ok=True)
    file_name = uuid.uuid4().hex + ext
    (folder / file_name).write_bytes(data)
    return file_name


def delete_work_file(user_id: int, file_name: str) -> None:
    if Path(file_name).name != file_name:
        return
    (WORKS_DIR / str(user_id) / file_name).unlink(missing_ok=True)


def work_url(user_id: int, file_name: str) -> str:
    return "/media/works/" + str(user_id) + "/" + quote(file_name)
