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
}

