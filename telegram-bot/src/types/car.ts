/**
 * Интерфейс для автомобиля
 */
export interface ICar {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year?: number | null;
  color?: string | null;
  licensePlate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

