/**
 * Интерфейс для категории автомобиля
 */
export interface ICarCategory {
  id: string;
  name: string;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

