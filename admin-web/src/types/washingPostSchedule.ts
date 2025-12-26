import type { IWashingPost } from './washingPost';

/**
 * Настройки поста на конкретную дату
 */
export interface IWashingPostSchedule {
  id: string;
  postId: string;
  date: string;
  isActive: boolean;
  workFromMinutes: number;
  workToMinutes: number;
  post?: IWashingPost;
  createdAt?: string;
  updatedAt?: string;
}


