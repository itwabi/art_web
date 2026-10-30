import shutil
import sys
from datetime import date

from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine
from app.media import WORKS_DIR, ensure_reference_folders
from app.models import (
    Challenge,
    ChallengeTopic,
    GeneratorItem,
    SavedGeneration,
    SketchCategory,
    User,
)
from app.security import hash_password

DEMO_NICKNAME = "Никнейм"
DEMO_PASSWORD = "demo123"

CATEGORIES = ["Позы", "Анатомия", "Портреты", "Руки", "Животные", "Пейзажи"]

THEMES = [
    "Заброшенная библиотека", "Подводный город", "Ночной рынок", "Маяк на краю света",
    "Старая оранжерея", "Космическая станция", "Лесная ярмарка", "Город в облаках",
    "Пустынный оазис", "Зимний вокзал", "Мастерская часовщика", "Остров музыкантов",
]

IDEAS = [
    "Лиса, читающая книгу при свете светлячков", "Робот, поливающий цветы на крыше",
    "Кит, плывущий над городом", "Девочка и дракон пьют чай", "Кот-астроном с телескопом",
    "Сова-почтальон в грозу", "Старик, который собирает звёзды в банки",
    "Лодка, плывущая по небу", "Медведь-пекарь на рассвете", "Дерево, внутри которого живёт дом",
    "Ёжик на воздушном шаре", "Улитка, несущая маленький город",
]

PALETTES = [
    ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
    ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"],
    ["#355070", "#6D597A", "#B56576", "#E56B6F", "#EAAC8B"],
    ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
    ["#05668D", "#028090", "#00A896", "#02C39A", "#F0F3BD"],
    ["#22223B", "#4A4E69", "#9A8C98", "#C9ADA7", "#F2E9E4"],
    ["#8ECAE6", "#219EBC", "#023047", "#FFB703", "#FB8500"],
    ["#CDB4DB", "#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF"],
]

GENERATIONS = [
    ("Лесной дух", "Старая оранжерея", "Лиса, читающая книгу при свете светлячков", PALETTES[3]),
    ("Космический кот", "Космическая станция", "Кот-астроном с телескопом", PALETTES[5]),
    ("Старая башня", "Маяк на краю света", "Сова-почтальон в грозу", PALETTES[1]),
    ("Рыбацкая лодка", "Подводный город", "Лодка, плывущая по небу", PALETTES[4]),
]

TOPICS_31 = [f"День {i}: тема" for i in range(1, 32)]
TOPICS_10 = [f"Задание {i}" for i in range(1, 11)]

CHALLENGES = [
    ("c1", "calendar", "Inktober", date(2026, 10, 1), date(2026, 10, 31),
     "Один рисунок тушью в день в течение октября. Тема дня берётся из официального списка. "
     "Допустимы любые материалы, но основа — линия и тушь.", TOPICS_31),
    ("c2", "calendar", "MerMay", date(2026, 5, 1), date(2026, 5, 31),
     "Майский марафон русалок: рисуем по одному персонажу в день.", TOPICS_31),
    ("c3", "calendar", "Drawtober", date(2026, 10, 1), date(2026, 10, 31),
     "Свободный октябрьский марафон без жёстких правил.", TOPICS_31),
    ("p1", "permanent", "100 дней рисования", None, None,
     "Рисуйте минимум 15 минут каждый день в течение 100 дней.", TOPICS_10),
    ("p2", "permanent", "Скетчбук-марафон", None, None,
     "Одна страница скетчбука в день на любую тему.", TOPICS_10),
]


def ensure_database() -> None:
    url = make_url(str(settings.sqlalchemy_url)) if settings.database_url else settings.sqlalchemy_url
    if url.get_backend_name() != "mysql":
        return
    server = create_engine(settings.server_url, isolation_level="AUTOCOMMIT")
    with server.connect() as conn:
        conn.execute(
            text(f"CREATE DATABASE IF NOT EXISTS `{settings.db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        )
    server.dispose()


def fill(db: Session) -> None:
    user = User(nickname=DEMO_NICKNAME, password_hash=hash_password(DEMO_PASSWORD), streak_days=5)
    db.add(user)
    db.flush()

    db.add_all(SketchCategory(name=name, position=i) for i, name in enumerate(CATEGORIES))

    for position, (cid, kind, title, start, end, desc, topics) in enumerate(CHALLENGES):
        db.add(Challenge(
            id=cid, kind=kind, title=title, date_start=start, date_end=end,
            description=desc, position=position,
            topics=[ChallengeTopic(position=i, title=t) for i, t in enumerate(topics)],
        ))

    db.add_all(GeneratorItem(kind="theme", value=v) for v in THEMES)
    db.add_all(GeneratorItem(kind="idea", value=v) for v in IDEAS)
    db.add_all(GeneratorItem(kind="palette", value=",".join(p)) for p in PALETTES)

    db.add_all(
        SavedGeneration(user_id=user.id, title=title, theme=theme, idea=idea, palette=palette)
        for title, theme, idea, palette in GENERATIONS
    )
    db.commit()


def main() -> None:
    reset = "--reset" in sys.argv
    ensure_database()
    if reset:
        Base.metadata.drop_all(engine)
        shutil.rmtree(WORKS_DIR, ignore_errors=True)  # загруженные фото относились к старой базе
    Base.metadata.create_all(engine)

    with Session(engine) as db:
        if db.scalars(select(User)).first() is not None:
            for user in db.scalars(select(User).where(User.password_hash.is_(None))):
                if user.nickname == DEMO_NICKNAME:
                    user.password_hash = hash_password(DEMO_PASSWORD)
            db.commit()
            ensure_reference_folders(list(db.scalars(select(SketchCategory.name))))
            print(f"В базе уже есть данные. Тестовый вход: {DEMO_NICKNAME} / {DEMO_PASSWORD}. Чтобы пересоздать их с нуля: python -m app.seed --reset")
            return
        fill(db)
        ensure_reference_folders(list(db.scalars(select(SketchCategory.name))))
    print(f"Готово: таблицы созданы, тестовые данные добавлены. Тестовый вход: {DEMO_NICKNAME} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    main()
