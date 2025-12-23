/**
 * Простой логгер для клиентской части
 * В production можно интегрировать с Sentry или другим сервисом
 */
const logger = {
  error: (message: string, data?: unknown) => {
    console.error(`[ERROR] ${message}`, data);
    // В production можно отправлять на сервер
    if (import.meta.env.PROD) {
      // fetch('/api/logs', { method: 'POST', body: JSON.stringify({ level: 'error', message, data }) })
    }
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data);
  },
  debug: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
};

export default logger;

