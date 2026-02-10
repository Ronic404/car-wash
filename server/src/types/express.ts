/**
 * Расширение типа Request для добавления информации об администраторе (JWT payload).
 * Подключается в main.ts (import './types/express') — при текущей конфигурации
 * global.d.ts не подтягивается при сборке, поэтому используется .ts + импорт.
 */
declare module 'express-serve-static-core' {
  interface Request {
    admin?: {
      adminId: string;
      email: string;
    };
  }
}

export {};
