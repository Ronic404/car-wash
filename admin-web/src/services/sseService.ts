import logger from '../utils/logger';

/**
 * Сервис для работы с Server-Sent Events (SSE)
 */
class SSEService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Получение токена из localStorage
   */
  private getToken(): string | null {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.token || null;
      }
    } catch (error) {
      logger.error('Ошибка получения токена из localStorage', { error });
    }
    return null;
  }

  /**
   * Подключение к SSE серверу
   */
  connect(): void {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = this.getToken();

    if (!token) {
      logger.warn('Токен не найден, SSE подключение невозможно');
      return;
    }

    // Создаем URL с токеном в query параметре (так как EventSource не поддерживает заголовки)
    const sseUrl = `${apiUrl}/api/sse/events?token=${encodeURIComponent(token)}`;

    try {
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        logger.info('SSE подключен');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          logger.debug('SSE сообщение получено', message);

          // Уведомляем всех слушателей этого типа события
          const listeners = this.listeners.get(message.type);
          if (listeners) {
            listeners.forEach((listener) => listener(message.data));
          }

          // Также уведомляем слушателей всех событий
          const allListeners = this.listeners.get('*');
          if (allListeners) {
            allListeners.forEach((listener) => listener(message));
          }
        } catch (error) {
          logger.error('Ошибка парсинга SSE сообщения', { error });
        }
      };

      this.eventSource.onerror = (error) => {
        logger.error('SSE ошибка', { error });
        
        // EventSource автоматически переподключится, но мы можем контролировать это
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          // Если соединение закрыто, пытаемся переподключиться
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            logger.info(`Попытка переподключения SSE ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => {
              if (this.eventSource?.readyState === EventSource.CLOSED) {
                this.disconnect();
                this.connect();
              }
            }, this.reconnectDelay);
          } else {
            logger.error('Достигнуто максимальное количество попыток переподключения SSE');
          }
        }
      };
    } catch (error) {
      logger.error('Ошибка подключения к SSE', { error });
    }
  }

  /**
   * Отключение от SSE сервера
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Подписка на события
   */
  on(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Возвращаем функцию для отписки
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Проверка состояния подключения
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

export default new SSEService();

