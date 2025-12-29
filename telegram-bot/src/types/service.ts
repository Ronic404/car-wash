/**
 * Интерфейс для цены услуги (для категории автомобиля)
 */
interface IServicePrice {
  id: string;
  serviceId: string;
  categoryId: string;
  price: number;
  category?: {
    id: string;
    name: string;
  };
}

/**
 * Интерфейс для услуги
 */
export interface IService {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  servicePrices?: IServicePrice[];
}

