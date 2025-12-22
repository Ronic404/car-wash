/**
 * Интерфейс для услуги
 */
export interface IService {
  id: string;
  name: string;
  description?: string | null;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Интерфейс для категории автомобиля
 */
export interface ICarCategory {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Интерфейс для цены услуги (связь услуга-категория)
 */
export interface IServicePrice {
  id: string | null;
  serviceId: string;
  categoryId: string;
  price: number | null;
  duration: number | null;
}

/**
 * Интерфейс для таблицы услуг
 */
export interface IServicesTable {
  services: IService[];
  categories: ICarCategory[];
  prices: IServicePrice[][]; // матрица [serviceIndex][categoryIndex]
}

