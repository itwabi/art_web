from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "challenges"


def load_topics(filename: str) -> list[str]:
    """Read numbered challenge topics from a UTF-8 text file."""
    path = DATA_DIR / filename
    if not path.is_file():
        raise FileNotFoundError(f"Не найден файл заданий челленджа: {path}")

    topics = []
    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        # Files may be numbered as "1. Topic" or contain plain text lines.
        if ". " in line and line.split(". ", 1)[0].isdigit():
            line = line.split(". ", 1)[1].strip()
        if line:
            topics.append(line)
    if not topics:
        raise ValueError(f"В файле заданий нет тем: {path}")
    return topics


CHALLENGE_DEFINITIONS = [
    {
        "id": "c1", "kind": "calendar", "title": "Inktober",
        "date_start": (2026, 10, 1), "date_end": (2026, 10, 31),
        "description": "Один рисунок тушью в день в течение октября. Тема дня берётся из списка Inktober.",
        "filename": "inktober.txt",
    },
    {
        "id": "c2", "kind": "calendar", "title": "MerMay",
        "date_start": (2026, 5, 1), "date_end": (2026, 5, 31),
        "description": "Майский марафон русалок: рисуем по одному рисунку в день по списку тем MerMay.",
        "filename": "mermay.txt",
    },
    {
        "id": "c3", "kind": "calendar", "title": "OKtober",
        "date_start": (2026, 10, 1), "date_end": (2026, 10, 31),
        "description": "Октябрьский челлендж про ваших оригинальных персонажей (ОС). Каждый день рисуйте своего ОС по теме дня.",
        "filename": "OKtober.txt",
    },
    {
        "id": "p1", "kind": "permanent", "title": "1 минута / 10 минут / 1 час",
        "date_start": None, "date_end": None,
        "description": "30 заданий для практики: нарисуйте каждую тему в трёх вариантах — за 1 минуту, 10 минут и 1 час.",
        "filename": "1min_10min_1hour.txt",
    },
    {
        "id": "p2", "kind": "permanent", "title": "Персонажи в разных стилях",
        "date_start": None, "date_end": None,
        "description": "30 заданий: выберите персонажа и нарисуйте его в стиле, указанном в задании.",
        "filename": "style.txt",
    },
]
