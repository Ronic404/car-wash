# Приложение для автомойки

Полнофункциональное приложение для управления автомойкой с Telegram ботом для клиентов и веб-панелью для администраторов.

## Архитектура проекта

Проект состоит из трех основных сервисов:

- **api** - REST API сервис на Express + TypeScript + PostgreSQL
- **telegram-bot** - Telegram бот для клиентов на Telegraf + TypeScript
- **admin-web** - Веб-приложение для администраторов на React + TypeScript + Vite

Все сервисы используют TypeScript и общую PostgreSQL базу данных.

## Структура проекта

```
car-wash/
├── api/                 # API сервис
│   ├── src/
│   │   ├── config/      # Конфигурация (logger, database)
│   │   ├── controllers/ # Контроллеры
│   │   ├── middleware/  # Middleware (auth, validation, error handling)
│   │   ├── routes/      # Маршруты
│   │   ├── services/    # Бизнес-логика (включая SSE сервис)
│   │   └── index.ts     # Точка входа
│   ├── prisma/          # Prisma схема
│   └── package.json
├── telegram-bot/        # Telegram бот
│   ├── src/
│   │   ├── config/      # Конфигурация (logger)
│   │   ├── handlers/    # Обработчики команд и callback
│   │   ├── services/    # Сервисы (API, пользователи)
│   │   └── index.ts     # Точка входа
│   └── package.json
├── admin-web/           # Веб-приложение
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы
│   │   ├── services/    # Сервисы (API, SSE)
│   │   ├── store/        # Zustand store
│   │   ├── styles/      # SCSS модули
│   │   └── main.tsx     # Точка входа
│   └── package.json
└── package.json         # Root package.json с workspaces
```

## Быстрый старт

### Требования

- Node.js >= 18.0.0
- Docker и Docker Compose (для базы данных)
- npm или yarn

### Установка

1. Клонируйте репозиторий
2. Установите зависимости:

```bash
npm install
```

3. Настройте переменные окружения для Docker Compose:

```bash
# Скопируйте пример файла
cp .env.example .env

# Отредактируйте .env и замените your-strong-password-here на реальный пароль
# (получите пароль из Bitwarden)
```

4. Запустите базу данных через Docker Compose:

```bash
docker compose up -d
```

Это создаст и запустит PostgreSQL контейнер на порту 5432.

5. Настройте переменные окружения для сервисов:

Создайте `.env` файлы в соответствующих директориях каждого сервиса:

```bash
# API .env
cd api
# Создайте .env файл с необходимыми переменными (см. api/README.md)

# Telegram bot .env
cd ../telegram-bot
# Создайте .env файл с TELEGRAM_BOT_TOKEN и API_URL

# Admin web .env
cd ../admin-web
# Создайте .env файл с VITE_API_URL (опционально, по умолчанию http://localhost:3000)
```

**Важно:** В `api/.env` используйте следующую строку подключения:
```
DATABASE_URL="postgresql://carwash:carwash123@localhost:5432/car_wash?schema=public"
```

6. Настройте базу данных:

```bash
cd api
npm run prisma:generate
npm run prisma:migrate
```

7. Запустите все сервисы:

```bash
npm run dev
```

Или запустите каждый сервис отдельно:

```bash
# API сервер
cd api && npm run dev

# Telegram бот
cd telegram-bot && npm run dev

# Веб-приложение
cd admin-web && npm run dev
```

## Docker Compose

Проект включает `docker-compose.yml` для запуска PostgreSQL базы данных локально.

### Настройка переменных окружения

Перед первым запуском настройте переменные окружения:

```bash
# Скопируйте пример файла
cp .env.example .env

# Отредактируйте .env и замените значения на реальные
# POSTGRES_PASSWORD - получите из Bitwarden
```

Файл `.env.example` содержит примеры переменных с дефолтными значениями для разработки. Для продакшена обязательно измените пароли на сильные.

### Запуск базы данных

```bash
docker compose up -d
```

### Остановка базы данных

```bash
docker compose down
```

### Просмотр логов

```bash
docker compose logs -f postgres
```

### Удаление данных базы (сброс)

```bash
docker compose down -v
```

**Параметры по умолчанию (из .env.example):**
- Пользователь: `carwash`
- Пароль: `your-strong-password-here` (нужно заменить на реальный)
- База данных: `car_wash`
- Порт: `5432`

**Важно:** Для продакшена обязательно измените пароль в `.env` файле на сильный пароль из Bitwarden.

## Переменные окружения

### Docker Compose (корневой `.env`)

Для Docker Compose используйте файл `.env` в корне проекта:

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте .env и замените значения на реальные
```

Файл `.env.example` содержит примеры переменных для Docker Compose:
- `POSTGRES_USER` - пользователь PostgreSQL
- `POSTGRES_PASSWORD` - пароль PostgreSQL (получите из Bitwarden)
- `POSTGRES_DB` - имя базы данных

### Сервисы

Каждый сервис использует свой `.env` файл в своей директории:

**API (`api/.env`):**
```env
DATABASE_URL="postgresql://carwash:YOUR_PASSWORD@localhost:5432/car_wash?schema=public"
API_PORT=3000
API_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
LOG_FILE_PATH=./logs
```

**Telegram Bot (`telegram-bot/.env`):**
```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
API_URL=http://localhost:3000
LOG_FILE_PATH=./logs
```

**Admin Web (`admin-web/.env`):**
```env
VITE_API_URL=http://localhost:3000
```

**Важно:** Все реальные секреты должны храниться в Bitwarden.

## Документация

- [API документация](./api/README.md) - Документация API сервиса
- [Telegram бот](./telegram-bot/README.md) - Документация Telegram бота
- [Веб-приложение](./admin-web/README.md) - Документация веб-приложения

## API документация

После запуска API сервера, Swagger документация доступна по адресу:
http://localhost:3000/api/docs

## Основные функции

### Для клиентов (Telegram бот)

- Просмотр доступных слотов на сегодня и завтра
- Выбор слота и услуги
- Добавление и управление своими автомобилями
- Просмотр своих записей
- Уведомления о подтверждении записи

### Для администраторов (Веб-приложение)

- Просмотр и управление записями
- Подтверждение/отмена/завершение записей
- Управление временными слотами
- Управление услугами и ценами
- Управление сотрудниками (в разработке)
- Real-time уведомления о новых записях через Server-Sent Events (SSE)

## Логирование

Все сервисы используют Winston для логирования. Логи сохраняются в директории `./logs`:

- `error.log` - только ошибки
- `combined.log` - все логи
- `telegram-bot-error.log` - ошибки бота
- `telegram-bot-combined.log` - все логи бота

## Разработка

### Структура базы данных

Схема базы данных определена в `api/prisma/schema.prisma`. Основные таблицы:

- `users` - пользователи (клиенты)
- `cars` - автомобили клиентов
- `services` - услуги автомойки
- `time_slots` - временные слоты для записи
- `bookings` - записи клиентов
- `employees` - сотрудники
- `admin_users` - администраторы

### Миграции базы данных

```bash
cd api
npm run prisma:migrate      # Создать новую миграцию
npm run prisma:studio       # Открыть Prisma Studio
```

## Production

### Сборка

```bash
npm run build
```

### Запуск

```bash
# API
cd api && npm start

# Telegram бот
cd telegram-bot && npm start

# Веб-приложение (после сборки)
cd admin-web && npm run preview
```

## Troubleshooting

### Проблемы с подключением к базе данных

1. Убедитесь, что Docker контейнер запущен:
```bash
docker compose ps
```

2. Проверьте, что `DATABASE_URL` в `api/.env` указан правильно:
```
DATABASE_URL="postgresql://carwash:YOUR_PASSWORD@localhost:5432/car_wash?schema=public"
```
Где `YOUR_PASSWORD` - это пароль из `.env` файла в корне проекта (переменная `POSTGRES_PASSWORD`).

3. Если контейнер не запущен, запустите его:
```bash
docker compose up -d
```

4. Проверьте логи контейнера:
```bash
docker compose logs postgres
```

### Проблемы с Telegram ботом

Проверьте, что `TELEGRAM_BOT_TOKEN` установлен и токен действителен.

### Проблемы с SSE

SSE работает через обычный HTTP, поэтому проблемы с файрволом маловероятны. Убедитесь, что API сервер доступен и токен аутентификации валиден.

## Лицензия

MIT

