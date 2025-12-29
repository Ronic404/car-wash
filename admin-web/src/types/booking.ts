import { ICar } from './car';
import { IUser } from './user';
import { IWashingPost } from './washingPost';

/**
 * Интерфейс для цены услуги (как приходит из API)
 */
interface IServicePrice {
  id: string;
  serviceId: string;
  categoryId: string;
  price: number;
}

/**
 * Интерфейс для услуги (как приходит из API)
 */
interface IBookingService {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
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
  postId: string;
  startAt: string; // ISO
  durationMinutes: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  user: IUser;
  car: ICar;
  service: IBookingService;
  post: IWashingPost;
}


