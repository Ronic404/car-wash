import 'telegraf';
import type { Scenes } from 'telegraf';

declare module 'telegraf' {
  interface Context {
    session?: Scenes.SceneSession<Scenes.SceneSessionData> & {
      selectedSlotId?: string | null;
      userId?: string;
    };
  }
}


