import type { IService } from './service';

interface IWashingPostServiceLink {
  id: string;
  postId: string;
  serviceId: string;
  service: IService;
  createdAt?: string;
}

/**
 * Моечный пост
 */
export interface IWashingPost {
  id: string;
  name: string;
  order: number;
  services?: IWashingPostServiceLink[];
  createdAt?: string;
  updatedAt?: string;
}


