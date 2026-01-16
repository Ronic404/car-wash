import { Context, Scenes } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';
import { ICar } from '../types/car';
import { capitalizeFirstLetter } from '../utils/stringUtils';
import { finalizeBookingFromSession } from '../handlers/slotsHandler';

/**
 * Интерфейс для данных сцены добавления автомобиля
 */
interface IAddCarSession extends Scenes.SceneSessionData {
  userId: string;
  carData: {
    brand?: string;
    model?: string;
    year?: number | null;
    color?: string | null;
    licensePlate?: string | null;
  };
}

/**
 * Сцена для добавления автомобиля
 */
export const addCarScene = new Scenes.BaseScene<Scenes.SceneContext<IAddCarSession>>('addCar');

async function finalizeBookingAfterCarCreateIfNeeded(ctx: Context, car: ICar) {
  ctx.session ??= {} as NonNullable<Context['session']>;
  const s = ctx.session!;

  const hasBookingContext = !!(s.selectedStartAt && s.selectedServiceId && s.selectedPostId);
  if (!hasBookingContext) return false;

  s.selectedCarId = car.id;
  s.waitingBookingNote = false;

  await ctx.reply(`✅ Автомобиль "${car.brand} ${car.model}" успешно добавлен!`);
  await finalizeBookingFromSession(ctx, null);

  return true;
}

// Telegraf отдаёт разные варианты SceneContext (в т.ч. с расширенной session), поэтому тип намеренно "широкий".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createCarAndContinue(ctx: any) {
  // Создаем автомобиль
  await ctx.reply('⏳ Создаю автомобиль...');

  const carData = ctx.scene.session.carData;
  const car = await apiService.createCar({
    userId: ctx.scene.session.userId,
    brand: capitalizeFirstLetter(carData.brand!),
    model: carData.model!,
    year: carData.year ?? undefined,
    color: carData.color ? carData.color.toLowerCase() : undefined,
    licensePlate: carData.licensePlate ?? undefined,
  });

  try {
    const finalized = await finalizeBookingAfterCarCreateIfNeeded(ctx, car);
    if (finalized) {
      logger.info('Создали запись после создания авто', { carId: car.id, userId: ctx.scene.session.userId });
      return ctx.scene.leave();
    }
  } catch (error) {
    logger.error('Ошибка создания записи после создания авто', { error, carId: car.id, userId: ctx.scene.session.userId });
    // продолжаем обычный flow (просто сообщим об авто)
  }

  await ctx.reply(`✅ Автомобиль "${car.brand} ${car.model}" успешно добавлен!`, {
    reply_markup: {
      inline_keyboard: [[{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }]],
    },
  });

  logger.info('Автомобиль создан через сцену', { carId: car.id, userId: ctx.scene.session.userId });
  return ctx.scene.leave();
}

// Шаг 1: Запрос марки автомобиля
addCarScene.enter(async (ctx) => {
  try {
    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе');
      return ctx.scene.leave();
    }

    const user = userService.getUserByTelegramId(telegramUser.id.toString());
    if (!user) {
      await ctx.reply('Пожалуйста, сначала запустите бота командой /start');
      return ctx.scene.leave();
    }

    // Инициализируем данные сцены
    ctx.scene.session.userId = user.id;
    ctx.scene.session.carData = {};

    await ctx.reply(
      'Введите марку автомобиля (например: Toyota, BMW, Mercedes):',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
          ],
        },
      }
    );
  } catch (error) {
    logger.error('Ошибка входа в сцену добавления автомобиля', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
    return await ctx.scene.leave();
  }
});

// Обработка отмены
addCarScene.action('cancel_add_car', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Добавление автомобиля отменено.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
      ],
    },
  });
  return ctx.scene.leave();
});

// Обработка пропуска года
addCarScene.action('skip_year', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.scene.session.carData.year = null;
  await ctx.reply('Введите цвет автомобиля (необязательно):', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⏭️ Пропустить', callback_data: 'skip_color' }],
        [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
      ],
    },
  });
});

// Обработка пропуска цвета
addCarScene.action('skip_color', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.scene.session.carData.color = null;
  await ctx.reply('Введите гос. номер (необязательно):', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⏭️ Пропустить', callback_data: 'skip_license_plate' }],
        [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
      ],
    },
  });
});

// Обработка пропуска гос. номера и завершение
addCarScene.action('skip_license_plate', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.scene.session.carData.licensePlate = null;
  
  return createCarAndContinue(ctx);
});

// Шаг 2: Получение марки
addCarScene.on('text', async (ctx) => {
  try {
    const text = ctx.message.text;
    const carData = ctx.scene.session.carData;

    // Шаг 1: Марка
    if (!carData.brand) {
      carData.brand = capitalizeFirstLetter(text.trim());
      await ctx.reply('Введите модель автомобиля:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
          ],
        },
      });
      return;
    }

    // Шаг 2: Модель
    if (!carData.model) {
      carData.model = text.trim();
      await ctx.reply('Введите год выпуска (необязательно):', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⏭️ Пропустить', callback_data: 'skip_year' }],
            [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
          ],
        },
      });
      return;
    }

    // Шаг 3: Год
    if (carData.year === undefined) {
      const year = parseInt(text);
      if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1) {
        carData.year = year;
      } else {
        // Невалидный год - просим ввести еще раз
        await ctx.reply('Год указан неверно. Введите год выпуска (например: 2020):', {
          reply_markup: {
            inline_keyboard: [
              [{ text: '⏭️ Пропустить', callback_data: 'skip_year' }],
              [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
            ],
          },
        });
        return;
      }
      await ctx.reply('Введите цвет автомобиля (необязательно):', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⏭️ Пропустить', callback_data: 'skip_color' }],
            [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
          ],
        },
      });
      return;
    }

    // Шаг 4: Цвет
    if (carData.color === undefined) {
      carData.color = text.trim().toLowerCase();
      await ctx.reply('Введите гос. номер (необязательно):', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⏭️ Пропустить', callback_data: 'skip_license_plate' }],
            [{ text: '❌ Отмена', callback_data: 'cancel_add_car' }],
          ],
        },
      });
      return;
    }

    // Шаг 5: Гос. номер и завершение
    if (carData.licensePlate === undefined) {
      carData.licensePlate = text.trim();

      return createCarAndContinue(ctx);
    }
  } catch (error) {
    logger.error('Ошибка обработки ввода данных автомобиля в сцене', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при добавлении автомобиля. Попробуйте позже.');
    return await ctx.scene.leave();
  }
});

// Обработка команды /start для выхода из сцены
addCarScene.command('start', async (ctx) => {
  await ctx.reply('Добавление автомобиля отменено.');
  return await ctx.scene.leave();
});
