/**
 * Интерфейс для пользователя
 */
export interface IUser {
  id: string;
  telegramId: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

