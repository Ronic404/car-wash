# Архитектура проекта car-wash

Этот репозиторий состоит из трёх основных приложений:

- **`api/`** — backend (Express + Prisma + PostgreSQL), единый источник данных.
- **`admin-web/`** — админ‑панель (React + React Router + React Query + Ant Design), управляет сущностями через REST API.
- **`telegram-bot/`** — Telegram‑бот (Telegraf), клиент для пользователей: записи, автомобили, прайс, уведомления.

Ниже — как эти части взаимодействуют между собой.

---

## Диаграмма взаимодействия

```text
┌───────────────────────────────┐                 ┌────────────────────────────┐
│          admin-web            │                 │        telegram-bot        │
│  React + Router + ReactQuery  │                 │   Telegraf + Scenes/Sess   │
└───────────────┬───────────────┘                 └───────────────┬────────────┘
                │ REST (JWT Bearer)                               │ REST
                │                                                 │
                v                                                 v
        ┌──────────────────────────────────────────────────────────────────┐
        │                              api                                 │
        │                    Express + Controllers/Services                │
        │            Auth (JWT) + Validation + Swagger + SSE               │
        └───────────────┬─────────────────────────────────┬────────────────┘
                        │ Prisma ORM                      │ SSE events
                        v                                 v
              ┌───────────────────┐             ┌─────────────────────────────┐
              │    PostgreSQL     │             │   SSE clients (EventSource) │
              │      Prisma       │             │     admin-web подписка      │
              └───────────────────┘             └─────────────────────────────┘
```

## Компоненты и их роли

### `api/` (Backend)

- **HTTP API**: предоставляет REST endpoints для всех клиентов (админка и бот).
- **Prisma**: доступ к БД и бизнес‑операции в `api/src/services/*`.
- **Auth для админки**: JWT (Bearer token).
- **SSE**: `api/src/routes/sse.ts` + `api/src/services/sseService.ts` — realtime‑уведомления для админки.
- **Swagger**: документация `/api/docs`.

Структура:

- **`api/src/routes/*`**: маршруты (контроллеры/роутеры).
- **`api/src/controllers/*`**: контроллеры, формируют HTTP‑ответы.
- **`api/src/services/*`**: бизнес‑логика, работа с Prisma.
- **`api/prisma/schema.prisma`**: модели БД (`User`, `Car`, `Booking`, `TimeSlot`, `Service`, `CarCategory`, `ServicePrice`).

### `admin-web/` (Админ‑панель)

- **API-клиент**: `admin-web/src/services/apiService.ts` (axios).
- **Кэш/запросы**: React Query (`useQuery`, `useMutation`) — страницы запрашивают данные и инвалидируют кэш.
- **SSE клиент**: `admin-web/src/services/sseService.ts` — подписки на события, чтобы обновлять UI без ручного рефреша.
- **Роутинг**: `admin-web/src/App.tsx` (страницы разложены по папкам `admin-web/src/pages/*`).

### `telegram-bot/` (Telegram бот)

- **API-клиент**: `telegram-bot/src/services/apiService.ts` (axios).
- **Сцены**: `telegram-bot/src/scenes/*` (например, добавление авто) — управление пошаговыми диалогами.
- **Handlers**: `telegram-bot/src/handlers/*` — обработчики callback/text.
- **Сессия**: через `telegraf-session-local` (хранение промежуточных шагов, выбранного слота и т.п.).

---

## Основные потоки взаимодействия

### 1) Админ логин (admin-web → api)

1. Админка отправляет `POST /api/admin/login`.
2. API возвращает JWT.
3. Админка сохраняет токен и добавляет его в `Authorization: Bearer ...` (axios interceptor).
4. Для получения профиля: `GET /api/admin/me`.

### 2) SSE уведомления (admin-web ⇐ api)

1. Админка открывает `EventSource` на `GET /api/sse/events?token=...` (токен в query, т.к. `EventSource` не поддерживает заголовки).
2. API проверяет JWT (middleware в `api/src/routes/sse.ts`).
3. API держит соединение открытым и рассылает события через `api/src/services/sseService.ts`.
4. Админка подписывается на типы событий (`new_booking`, `booking_update`) и, как правило, делает `react-query invalidateQueries()` или обновляет локальное состояние.

### 3) Создание записи пользователем (telegram-bot → api → admin-web(SSE))

1. Бот показывает доступные слоты (`GET /api/slots/available`) и сохраняет выбранный `slotId` в `ctx.session`.
2. Бот показывает автомобили пользователя (`GET /api/cars/user/:userId`).
3. Бот показывает услуги (`GET /api/services/active`).
4. Бот создаёт запись (`POST /api/bookings`).
5. API после создания вызывает `sseService.notifyNewBooking(...)`.
6. Админка получает SSE `new_booking` и обновляет списки/детали.

### 4) Прайс услуг (telegram-bot → api)

В API цена/длительность услуги хранятся в `ServicePrice` и привязаны к `CarCategory`.

- Общий прайс: бот запрашивает `GET /api/services/active`, строит диапазоны (min/max) по `servicePrices`.
- Точный прайс: бот предлагает выбрать категорию (`GET /api/car-categories/active`) и показывает цену/длительность для выбранной категории.

---

## Данные и связи (БД)

Ключевые связи:

- `User 1—N Car`
- `User 1—N Booking`
- `Car 1—N Booking`
- `TimeSlot 1—N Booking`
- `Service 1—N Booking`
- `Service N—N CarCategory` через `ServicePrice` (цена + длительность)

Важный момент: **`Service.price`/`Service.duration` не используются как “одна цена”** — актуальные значения лежат в `ServicePrice`.

---

## Где лежит бизнес‑логика

- **API**: в `api/src/services/*` (Prisma queries + проверки).
- **admin-web**: только UI/оркестрация запросов (React Query, формы, таблицы).
- **telegram-bot**: диалоговая логика (сцены/handlers) + вызовы API.

---

## Типичные места расширения

- **Новый endpoint**: `api/src/routes` → `api/src/controllers` → `api/src/services`.
- **Новый экран в админке**: `admin-web/src/pages/...` + методы в `admin-web/src/services/apiService.ts`.
- **Новый сценарий в боте**: `telegram-bot/src/scenes` или `telegram-bot/src/handlers` + метод в `telegram-bot/src/services/apiService.ts`.


