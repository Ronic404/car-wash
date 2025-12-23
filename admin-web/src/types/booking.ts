import { ICar } from './car';
import { IUser } from './user';

/**
 * Интерфейс для цены услуги (как приходит из API)
 */
export interface IServicePrice {
  id: string;
  serviceId: string;
  categoryId: string;
  price: number;
  duration: number;
}

/**
 * Интерфейс для услуги (как приходит из API)
 */
export interface IBookingService {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  order?: number;
  // Может быть включено отдельным include — поэтому опционально
  servicePrices?: IServicePrice[];
}

/**
 * Интерфейс для записи
 */
export interface IBooking {
  id: string;
  userId: string;
  carId: string;
  serviceId: string;
  slotId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  user: IUser;
  car: ICar;
  service: IBookingService;
  slot: {
    id: string;
    date: string;
    duration: number;
    isAvailable: boolean;
    maxBookings: number;
  };
}


