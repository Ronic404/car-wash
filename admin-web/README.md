# Веб-приложение для администраторов

Веб-приложение для управления автомойкой на React + TypeScript + Vite.

## Технологии

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query (React Query)
- Zustand (state management)
- Axios
- SCSS модули
- Server-Sent Events (SSE) (real-time обновления)

## Установка

```bash
npm install
```

## Настройка

1. Создайте `.env` файл (опционально):

```env
VITE_API_URL=http://localhost:3000
```

По умолчанию используется `http://localhost:3000`.

## Запуск

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Структура проекта

```
src/
├── components/     # React компоненты
│   └── Layout.tsx
├── pages/         # Страницы приложения
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── BookingsPage.tsx
│   ├── BookingDetailPage.tsx
│   ├── SlotsPage.tsx
│   ├── ServicesPage.tsx
│   └── EmployeesPage.tsx
├── services/      # Сервисы
│   ├── apiService.ts      # HTTP запросы к API
│   └── sseService.ts      # SSE клиент
├── store/         # Zustand stores
│   └── authStore.ts
├── hooks/         # React hooks
│   └── useSSE.ts  # Хук для работы с SSE
├── styles/        # SCSS модули
└── main.tsx       # Точка входа
```

## Страницы

### Login

Страница входа для администраторов. После успешного входа, токен сохраняется в localStorage.

### Dashboard

Главная панель со статистикой:
- Количество записей, ожидающих подтверждения
- Количество подтвержденных записей
- Записи на сегодня

### Bookings

Список всех записей с фильтрами по статусу. Можно перейти к деталям записи для подтверждения/отмены/завершения.

### Booking Detail

Детальная информация о записи с возможностью:
- Подтвердить запись
- Отменить запись
- Завершить запись

### Slots

Управление временными слотами (просмотр, создание, редактирование, удаление).

### Services

Управление услугами (просмотр, создание, редактирование, удаление).

### Employees

Управление сотрудниками (в разработке).

## Real-time обновления

Приложение использует Server-Sent Events (SSE) для получения real-time уведомлений о:
- Новых записях
- Обновлениях записей

При получении уведомления, кеш React Query автоматически обновляется.

## Адаптивность

Приложение адаптировано под мобильные устройства. Используются SCSS модули для стилизации.

## Логирование

Клиентское логирование реализовано через простой logger. В production можно интегрировать с Sentry или другим сервисом.

## State Management

- **Zustand** - для глобального состояния (аутентификация)
- **React Query** - для серверного состояния (запросы к API)

## Роутинг

Используется React Router v6 с защищенными маршрутами. Неавторизованные пользователи перенаправляются на страницу входа.

