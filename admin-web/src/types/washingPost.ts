import type { IService } from './service';

/**
 * Моечный пост
 */
export interface IWashingPost {
  id: string;
  name: string;
  order: number;
  workFromMinutes: number;
  workToMinutes: number;
  services?: IService[];
  createdAt?: string;
  updatedAt?: string;
}


