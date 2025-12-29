import type { ICar } from './car';

/**
 * Интерфейс для пользователя (клиент)
 */
export interface IUser {
  id: string;
  telegramId?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
  cars?: ICar[];
}


