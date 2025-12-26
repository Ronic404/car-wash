import type { IWashingPost } from './washingPost';
import type { IService } from './service';

export type TimeBlockKind = 'BLOCK' | 'MANUAL_BOOKING';

export interface ITimeBlock {
  id: string;
  postId: string;
  startAt: string;
  endAt: string;
  kind: TimeBlockKind;
  serviceId?: string | null;
  carBrand?: string | null;
  carModel?: string | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
  post?: IWashingPost;
  service?: IService;
}


