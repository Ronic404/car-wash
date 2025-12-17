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
│   │   ├── services/    # Бизнес-логика
│   │   ├── websocket/   # WebSocket сервер
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
│   │   ├── services/    # Сервисы (API, WebSocket)
│   │   ├── store/        # Zustand store
│   │   ├── styles/      # SCSS модули
│   │   └── main.tsx     # Точка входа
│   └── package.json
└── package.json         # Root package.json с workspaces
```

## Быстрый старт

### Требования

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm или yarn

### Установка

1. Клонируйте репозиторий
2. Установите зависимости:

```bash
npm install
```

3. Настройте переменные окружения:

Скопируйте `.env.example` в корень проекта и заполните необходимые значения:

```bash
cp .env.example .env
```

4. Настройте базу данных:

```bash
cd api
npm run prisma:generate
npm run prisma:migrate
```

5. Запустите все сервисы:

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

## Переменные окружения

Создайте `.env` файл в корне проекта со следующими переменными:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/car_wash?schema=public"

# API
API_PORT=3000
API_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

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
- Real-time уведомления о новых записях через WebSocket

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

Убедитесь, что PostgreSQL запущен и `DATABASE_URL` указан правильно.

### Проблемы с Telegram ботом

Проверьте, что `TELEGRAM_BOT_TOKEN` установлен и токен действителен.

### Проблемы с WebSocket

Убедитесь, что порт WebSocket не заблокирован файрволом.

## Лицензия

MIT

