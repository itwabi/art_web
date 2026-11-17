# art_web

## Запуск в Docker

1. Установите Docker Desktop и запустите его.
2. Скопируйте `.env.example` в `.env` и впишите свой пароль в `DB_PASSWORD`.
3. В корне проекта выполните `docker compose up --build`.
4. Откройте http://localhost:8080 (документация API: http://localhost:8080/docs).

Тестовый вход: `Никнейм` / `demo123`.

Остановить: `docker compose down`. Данные базы и загруженные фото сохраняются.
Удалить вместе с базой: `docker compose down -v`.
