# Telegram Бот

Telegram бот для клиентов автомойки на Telegraf + TypeScript.

## Технологии

- Telegraf
- TypeScript
- Axios (для HTTP запросов к API)
- Winston (логирование)

## Установка

```bash
npm install
```

## Настройка

1. Создайте `.env` файл:

```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
API_URL=http://localhost:3000
LOG_FILE_PATH=./logs
```

2. Получите токен бота у [@BotFather](https://t.me/botfather) в Telegram

## Запуск

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Команды бота

- `/start` - Запуск бота и главное меню

## Функционал

### Просмотр слотов

Пользователь может просмотреть доступные слоты на сегодня и завтра, выбрать нужный слот и услугу.

### Управление автомобилями

Пользователь может:
- Добавлять новые автомобили (марка, модель, год, цвет, гос. номер)
- Просматривать список своих автомобилей
- Выбирать автомобиль при создании записи

### Записи

Пользователь может:
- Создавать новые записи
- Просматривать список своих записей
- Получать уведомления о подтверждении записи администратором

## Структура проекта

```
src/
├── config/         # Конфигурация (logger)
├── handlers/       # Обработчики команд и callback
│   ├── startHandler.ts
│   ├── slotsHandler.ts
│   ├── carHandler.ts
│   ├── bookingHandler.ts
│   ├── carsHandler.ts
│   ├── callbackHandler.ts
│   └── messageHandler.ts
├── services/       # Сервисы
│   ├── apiService.ts      # Взаимодействие с API
│   └── userService.ts    # Работа с пользователями
└── index.ts        # Точка входа
```

## Логирование

Логи сохраняются в директории `./logs`:
- `telegram-bot-error.log` - только ошибки
- `telegram-bot-combined.log` - все логи

## Интеграция с API

Бот взаимодействует с API сервисом через HTTP запросы. Все запросы логируются для отладки.

## Обработка ошибок

Все ошибки логируются и пользователю отправляется понятное сообщение об ошибке.

