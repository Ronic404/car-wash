import { Context } from 'telegraf';
import type { InlineKeyboardButton } from 'telegraf/types';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';
import type { IAvailabilityOption } from '../types/availability';
import type { IService } from '../types/service';
import { safeAnswerCb } from '../utils/telegrafUtils';
import { pluralizeRu } from '../utils/stringUtils';

type IAvailabilityGroup = {
  startAt: string;
  posts: Array<{ id: string; name: string; order: number }>;
};

/**
 * Обработчик просмотра доступных слотов
 */
export async function handleViewSlots(ctx: Context) {
  try {
    await safeAnswerCb(ctx);

    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе');
      return;
    }

    const user = userService.getUserByTelegramId(telegramUser.id.toString());
    if (!user) {
      await ctx.reply('Пожалуйста, сначала запустите бота командой /start');
      return;
    }

    await ctx.reply('Выберите услугу:', {
      reply_markup: {
        inline_keyboard: await buildServicesKeyboard(ctx),
      },
    });
  } catch (error) {
    logger.error('Ошибка получения слотов', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке слотов. Попробуйте позже.');
  }
}

async function buildServicesKeyboard(_ctx: Context): Promise<InlineKeyboardButton[][]> {
  const services: IService[] = await apiService.getActiveServices();
  const buttons: InlineKeyboardButton[][] = services.map((s) => [
    { text: s.name, callback_data: `select_service_for_slots_${s.id}` },
  ]);
  buttons.push([{ text: '◀️ Назад', callback_data: 'back_to_menu' }]);
  return buttons;
}

async function askCarSelect(ctx: Context, userId: string) {
  const cars = await apiService.getUserCars(userId);
  if (cars.length === 0) {
    await ctx.reply('У вас нет сохраненных автомобилей. Давайте добавим новый автомобиль.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Добавить автомобиль', callback_data: 'add_car' }],
          [{ text: '◀️ Назад', callback_data: 'view_slots' }],
        ],
      },
    });
    return;
  }

  const buttons = cars.map((car) => [
    {
      text: `${car.brand} ${car.model}${car.licensePlate ? ` (${car.licensePlate})` : ''}`,
      callback_data: `select_car_for_time_${car.id}`,
    },
  ]);
  buttons.push([{ text: '➕ Добавить новый автомобиль', callback_data: 'add_car' }]);
  buttons.push([{ text: '◀️ Назад', callback_data: 'view_slots' }]);

  await ctx.reply('Выберите автомобиль для мойки:', {
    reply_markup: { inline_keyboard: buttons },
  });
}

export async function handleSelectServiceForSlots(ctx: Context, serviceId: string) {
  try {
    await safeAnswerCb(ctx);

    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе');
      return;
    }

    const user = userService.getUserByTelegramId(telegramUser.id.toString());
    if (!user) {
      await ctx.reply('Пожалуйста, сначала запустите бота командой /start');
      return;
    }

    await ctx.reply('⏳ Подбираю доступное время...');

    const optionsRaw: IAvailabilityOption[] = await apiService.getAvailability(new Date(), serviceId);
    const nowMs = Date.now();
    const options = optionsRaw.filter((o) => new Date(o.startAt).getTime() > nowMs);
    if (options.length === 0) {
      await ctx.reply('К сожалению, на ближайшие дни нет доступного времени под эту услугу.');
      return;
    }

    ctx.session ??= {};
    ctx.session.userId = user.id;
    ctx.session.selectedServiceId = serviceId;
    ctx.session.availabilityOptions = options;

    // Группируем одинаковое время (могут быть несколько постов на один startAt)
    const groupsMap = new Map<string, IAvailabilityGroup>();
    for (const opt of options) {
      const g = groupsMap.get(opt.startAt) ?? { startAt: opt.startAt, posts: [] };
      g.posts.push({ id: opt.postId, name: opt.postName, order: opt.postOrder });
      groupsMap.set(opt.startAt, g);
    }

    const groups = Array.from(groupsMap.values())
      .map((g) => ({
        ...g,
        posts: g.posts
          .sort((a, b) => a.order - b.order)
          .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx),
      }))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

    ctx.session.availabilityGroups = groups;

    const byDate: Record<string, Array<{ groupIdx: number; group: IAvailabilityGroup }>> = {};
    groups.forEach((group, groupIdx) => {
      const date = new Date(group.startAt).toLocaleDateString('ru-RU');
      byDate[date] ??= [];
      byDate[date].push({ groupIdx, group });
    });

    const buttons: InlineKeyboardButton[][] = [];
    Object.keys(byDate).forEach((date) => {
      byDate[date].forEach(({ groupIdx, group }) => {
        const time = new Date(group.startAt).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const postsCount = group.posts.length;
        const suffix = postsCount > 1 ? ` (${postsCount} ${pluralizeRu(postsCount, 'место', 'места', 'мест')})` : '';
        buttons.push([{ text: `${date} ${time}${suffix}`, callback_data: `select_time_${groupIdx}` }]);
      });
    });

    buttons.push([{ text: '◀️ Назад', callback_data: 'view_slots' }]);

    await ctx.reply('📅 Выберите удобное время:', { reply_markup: { inline_keyboard: buttons } });
  } catch (error) {
    logger.error('Ошибка выбора услуги для слотов', { error, serviceId, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function handleSelectTime(ctx: Context, idxRaw: string) {
  try {
    await safeAnswerCb(ctx);
    const idx = Number(idxRaw);
    if (!Number.isInteger(idx) || idx < 0) {
      await ctx.reply('Ошибка: некорректный выбор времени.');
      return;
    }

    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе');
      return;
    }

    const user = userService.getUserByTelegramId(telegramUser.id.toString());
    if (!user) {
      await ctx.reply('Пожалуйста, сначала запустите бота командой /start');
      return;
    }

    const group = ctx.session?.availabilityGroups?.[idx];
    if (!group) {
      await ctx.reply('Ошибка: выбранное время устарело. Откройте список заново.');
      return;
    }

    ctx.session ??= {};
    ctx.session.userId = user.id;
    ctx.session.selectedStartAt = group.startAt;

    ctx.session.selectedPostId = group.posts[0]?.id;
    await askCarSelect(ctx, user.id);
  } catch (error) {
    logger.error('Ошибка выбора времени', { error, idxRaw, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function handleSelectPostForTime(ctx: Context, groupIdxRaw: string, postId: string) {
  try {
    await safeAnswerCb(ctx);
    const groupIdx = Number(groupIdxRaw);
    if (!Number.isInteger(groupIdx) || groupIdx < 0) {
      await ctx.reply('Ошибка: некорректный выбор поста.');
      return;
    }

    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе');
      return;
    }

    const user = userService.getUserByTelegramId(telegramUser.id.toString());
    if (!user) {
      await ctx.reply('Пожалуйста, сначала запустите бота командой /start');
      return;
    }

    const group = ctx.session?.availabilityGroups?.[groupIdx];
    if (!group) {
      await ctx.reply('Ошибка: выбранное время устарело. Откройте список заново.');
      return;
    }

    const allowed = group.posts.some((p) => p.id === postId);
    if (!allowed) {
      await ctx.reply('Ошибка: пост недоступен для выбранного времени.');
      return;
    }

    ctx.session ??= {};
    ctx.session.userId = user.id;
    ctx.session.selectedStartAt = group.startAt;
    ctx.session.selectedPostId = postId;
    await askCarSelect(ctx, user.id);
  } catch (error) {
    logger.error('Ошибка выбора поста', { error, groupIdxRaw, postId, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

export async function handleSelectCarForTime(ctx: Context, carId: string) {
  try {
    await safeAnswerCb(ctx);

    const userId = ctx.session?.userId;
    const serviceId = ctx.session?.selectedServiceId ?? undefined;
    const postId = ctx.session?.selectedPostId ?? undefined;
    const startAt = ctx.session?.selectedStartAt ?? undefined;

    if (!userId || !serviceId || !postId || !startAt) {
      await ctx.reply('Ошибка: не хватает данных для записи. Начните заново.');
      return;
    }

    ctx.session ??= {};
    ctx.session.selectedCarId = carId;
    ctx.session.waitingBookingNote = true;

    await ctx.reply(
      '✏️ Добавьте комментарий для администратора (до 500 символов). Отправьте текст или нажмите «Без комментария».',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Без комментария', callback_data: 'booking_note_skip' }],
            [{ text: 'Отмена', callback_data: 'booking_note_cancel' }],
          ],
        },
      }
    );
  } catch (error) {
    logger.error('Ошибка создания записи (by-time) после выбора авто', { error, carId, userId: ctx.from?.id });
    await ctx.reply('Не удалось создать запись. Попробуйте позже.');
  }
}

export async function finalizeBookingFromSession(ctx: Context, note: string | null) {
  try {
    const session = ctx.session ?? {};
    const userId = session.userId;
    const serviceId = session.selectedServiceId ?? undefined;
    const postId = session.selectedPostId ?? undefined;
    const startAt = session.selectedStartAt ?? undefined;
    const carId = session.selectedCarId ?? undefined;

    if (!userId || !serviceId || !postId || !startAt || !carId) {
      await ctx.reply('Ошибка: не хватает данных для записи. Начните заново.');
      return;
    }

    await ctx.reply('⏳ Создаю запись...');
    await apiService.createBookingByTime({
      userId,
      carId,
      serviceId,
      postId,
      startAt,
      notes: note ?? undefined,
    });

    ctx.session = {
      ...session,
      availabilityOptions: null,
      availabilityGroups: null,
      selectedPostId: null,
      selectedStartAt: null,
      selectedServiceId: null,
      selectedCarId: null,
      waitingBookingNote: false,
    };

    await ctx.reply('✅ Запись создана и отправлена на подтверждение администратору.');
  } catch (error) {
    logger.error('Ошибка создания записи (by-time) после комментария', { error, userId: ctx.from?.id });
    await ctx.reply('Не удалось создать запись. Попробуйте позже.');
  }
}

