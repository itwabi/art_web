from pathlib import Path
from urllib.parse import quote

MEDIA_DIR = Path(__file__).resolve().parent.parent / "media"
REFERENCES_DIR = MEDIA_DIR / "references"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

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
