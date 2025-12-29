import 'telegraf';
import type { Scenes } from 'telegraf';
import type { IAvailabilityOption } from './availability';

declare module 'telegraf' {
  interface Context {
    session?: Scenes.SceneSession<Scenes.SceneSessionData> & {
      userId?: string;
      selectedServiceId?: string | null;
      selectedPostId?: string | null;
      selectedStartAt?: string | null;
      selectedCarId?: string | null;
      waitingBookingNote?: boolean;
      availabilityOptions?: IAvailabilityOption[] | null;
      availabilityGroups?: Array<{
        startAt: string;
        posts: Array<{ id: string; name: string; order: number }>;
      }> | null;
    };
  }
}


