import { ICar } from './car';
import { IUser } from './user';

/**
 * Интерфейс для записи (минимальный набор для списка слотов)
 */
export interface ISlotBooking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  user?: IUser;
  car?: ICar;
}

/**
 * Интерфейс для временного слота
 */
export interface ISlot {
  id: string;
  date: string;
  duration: number;
  isAvailable: boolean;
  maxBookings: number;
  bookings?: ISlotBooking[];
  createdAt?: string;
  updatedAt?: string;
}


