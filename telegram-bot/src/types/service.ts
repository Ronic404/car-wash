/**
 * Интерфейс для услуги
 */
export interface IService {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

