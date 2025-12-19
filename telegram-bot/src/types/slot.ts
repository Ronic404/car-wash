/**
 * Интерфейс для временного слота
 */
export interface ISlot {
  id: string;
  date: string;
  duration: number;
  isAvailable: boolean;
  maxBookings: number;
  createdAt?: string;
  updatedAt?: string;
}

