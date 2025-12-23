import { ICar } from './car';
import { IService } from './service';
import { ISlot } from './slot';

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
  // Связанные объекты (приходят из API с include)
  car?: ICar;
  service?: IService;
  slot?: ISlot;
}

