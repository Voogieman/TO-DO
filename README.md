# To-Do API (NestJS + PostgreSQL)

Backend для мобильного приложения управления задачами (To-Do) с JWT-аутентификацией, фильтрацией задач, пагинацией и архивированием удаленных задач на 7 дней.

## Технологии

- Node.js + NestJS (монолит, модульная структура)
- PostgreSQL + TypeORM
- JWT (Passport)
- Swagger (документация API на русском)
- Rate limiting (`@nestjs/throttler`)
- Cron-задача для очистки архивных задач

## Функциональность

- Регистрация и авторизация пользователей по JWT.
- CRUD для задач с привязкой к владельцу.
- Доступ к задачам только для авторизованного пользователя.
- Фильтрация задач по статусам: `todo`, `in_progress`, `done`.
- Пагинация списка задач (`page`, `limit`).
- Удаление задачи через архив:
  - при `DELETE` задача не удаляется сразу;
  - переводится в архив на 7 дней (`archivedAt`, `purgeAt`);
  - редактирование архивной задачи запрещено;
  - cron ежедневно удаляет просроченные архивные задачи из БД.

## Структура API

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/health` — health check
- `POST /api/tasks` — создать задачу
- `GET /api/tasks` — список задач (фильтр + пагинация)
- `GET /api/tasks/:id` — получить задачу
- `PATCH /api/tasks/:id` — обновить задачу
- `DELETE /api/tasks/:id` — архивировать задачу на 7 дней

Swagger доступен по адресу: `http://localhost:3000/docs`

## Быстрый старт (локально)

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env` на основе примера:

```bash
cp .env.example .env
```

Для Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Поднимите PostgreSQL (локально или через Docker) и проверьте параметры в `.env`.

4. Запустите приложение:

```bash
npm run start:dev
```

## Локальная проверка эндпоинтов (пошагово)

1. Убедитесь, что API поднят:

```bash
curl http://localhost:3000/api/health
```

2. Зарегистрируйте пользователя:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"StrongPass123\"}"
```

3. Авторизуйтесь и скопируйте `accessToken`:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"StrongPass123\"}"
```

4. Проверьте защищенный эндпоинт без токена (должен быть `401`):

```bash
curl -i "http://localhost:3000/api/tasks?page=1&limit=10"
```

5. Проверьте создание и получение задач с токеном:

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Подготовить релиз\",\"description\":\"Проверить документацию\"}"

curl "http://localhost:3000/api/tasks?status=todo&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

6. Проверка через Swagger:
   - откройте `http://localhost:3000/docs`;
   - нажмите **Authorize** и вставьте `Bearer <JWT_TOKEN>`;
   - тестируйте `GET /api/tasks` c query-параметрами `status`, `page`, `limit`.

## Запуск через Docker

```bash
docker compose up --build
```

После запуска:
- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`

## Пример `.env`

См. файл `.env.example`:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SYNC`
- `JWT_SECRET`
- `JWT_EXPIRES_IN_SECONDS`

## Примеры curl-запросов

### 1) Регистрация

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"StrongPass123\"}"
```

### 2) Авторизация

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"StrongPass123\"}"
```

Сохраните `accessToken` из ответа.

### 3) Создание задачи

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Подготовить релиз\",\"description\":\"Проверить документацию\"}"
```

### 4) Получение задач с фильтром и пагинацией

```bash
curl "http://localhost:3000/api/tasks?status=todo&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 5) Обновление задачи

```bash
curl -X PATCH http://localhost:3000/api/tasks/<TASK_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"in_progress\"}"
```

### 6) Удаление (архив на 7 дней)

```bash
curl -X DELETE http://localhost:3000/api/tasks/<TASK_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Проверка качества

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```
