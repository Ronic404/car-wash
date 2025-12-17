# API Сервис

REST API сервис для приложения автомойки на Express + TypeScript + PostgreSQL.

## Технологии

- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Winston (логирование)
- Swagger (документация)
- WebSocket (real-time уведомления)

## Установка

```bash
npm install
```

## Настройка

1. Создайте `.env` файл:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/car_wash?schema=public"
API_PORT=3000
API_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

2. Настройте базу данных:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Запуск

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Аутентификация

- `POST /api/admin/register` - Регистрация администратора
- `POST /api/admin/login` - Вход администратора
- `GET /api/admin/me` - Получение информации о текущем администраторе

### Записи

- `POST /api/bookings` - Создание записи
- `GET /api/bookings` - Получение всех записей (с фильтрами)
- `GET /api/bookings/:id` - Получение записи по ID
- `PATCH /api/bookings/:id/confirm` - Подтверждение записи
- `PATCH /api/bookings/:id/cancel` - Отмена записи
- `PATCH /api/bookings/:id/complete` - Завершение записи

### Слоты

- `GET /api/slots/available` - Получение доступных слотов
- `GET /api/slots` - Получение всех слотов (admin)
- `POST /api/slots` - Создание слота (admin)
- `PATCH /api/slots/:id` - Обновление слота (admin)
- `DELETE /api/slots/:id` - Удаление слота (admin)

### Услуги

- `GET /api/services/active` - Получение активных услуг
- `GET /api/services` - Получение всех услуг (admin)
- `GET /api/services/:id` - Получение услуги по ID
- `POST /api/services` - Создание услуги (admin)
- `PATCH /api/services/:id` - Обновление услуги (admin)
- `DELETE /api/services/:id` - Удаление услуги (admin)

### Автомобили

- `POST /api/cars` - Создание автомобиля
- `GET /api/cars/user/:userId` - Получение автомобилей пользователя
- `GET /api/cars/:id` - Получение автомобиля по ID
- `PATCH /api/cars/:id` - Обновление автомобиля
- `DELETE /api/cars/:id` - Удаление автомобиля

### Пользователи

- `POST /api/users/telegram` - Получение/создание пользователя по Telegram ID
- `GET /api/users/:id` - Получение пользователя по ID

## WebSocket

WebSocket сервер доступен по адресу `ws://localhost:3000/ws`.

События:
- `new_booking` - новая запись создана
- `booking_update` - запись обновлена

## Swagger документация

После запуска сервера, Swagger документация доступна по адресу:
http://localhost:3000/api/docs

## Логирование

Логи сохраняются в директории `./logs`:
- `error.log` - только ошибки
- `combined.log` - все логи

## Структура проекта

```
src/
├── config/         # Конфигурация (logger, database, swagger)
├── controllers/    # Контроллеры для обработки запросов
├── middleware/     # Middleware (auth, validation, error handling)
├── routes/         # Маршруты API
├── services/       # Бизнес-логика
├── websocket/      # WebSocket сервер
└── index.ts        # Точка входа
```

## Тестирование

```bash
npm test
```

