import { Context } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';

/**
 * Обработчик добавления автомобиля
 */
export async function handleAddCar(ctx: Context) {
  try {
    await ctx.answerCbQuery();

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

    // Сохраняем состояние - пользователь добавляет автомобиль
    (ctx as any).session = (ctx as any).session || {};
    (ctx as any).session.addingCar = true;
    (ctx as any).session.userId = user.id;
    (ctx as any).session.carData = {};

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
    logger.error('Ошибка начала добавления автомобиля', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

/**
 * Обработчик отмены добавления автомобиля
 */
export async function handleCancelAddCar(ctx: Context) {
  try {
    await ctx.answerCbQuery();

    (ctx as any).session = (ctx as any).session || {};
    (ctx as any).session.addingCar = false;
    (ctx as any).session.carData = {};

    await ctx.reply('Добавление автомобиля отменено.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
        ],
      },
    });
  } catch (error) {
    logger.error('Ошибка отмены добавления автомобиля', { error });
  }
}

/**
 * Обработчик выбора автомобиля для записи
 */
export async function handleSelectCar(ctx: Context, carId: string) {
  try {
    await ctx.answerCbQuery();

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

    const session = (ctx as any).session || {};
    const slotId = session.selectedSlotId;

    if (!slotId) {
      await ctx.reply('Ошибка: слот не выбран. Начните заново.');
      return;
    }

    // Получаем активные услуги
    const services = await apiService.getActiveServices();

    if (services.length === 0) {
      await ctx.reply('К сожалению, сейчас нет доступных услуг.');
      return;
    }

    // Показываем список услуг
    const buttons = services.map((service: any) => [
      {
        text: `${service.name} - ${service.price}₽`,
        callback_data: `select_service_${service.id}_${carId}_${slotId}`,
      },
    ]);

    buttons.push([{ text: '◀️ Назад', callback_data: 'view_slots' }]);

    await ctx.reply('Выберите услугу:', {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  } catch (error) {
    logger.error('Ошибка выбора автомобиля', { error, carId, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

/**
 * Обработчик создания автомобиля из текстового ввода
 */
export async function handleCarInput(ctx: Context, step: string, value: string) {
  try {
    const session = (ctx as any).session || {};
    if (!session.addingCar) {
      return;
    }

    const carData = session.carData || {};

    if (step === 'brand') {
      carData.brand = value;
      await ctx.reply('Введите модель автомобиля:');
      (ctx as any).session.carData = carData;
    } else if (step === 'model') {
      carData.model = value;
      await ctx.reply('Введите год выпуска (необязательно, или отправьте "пропустить"):');
      (ctx as any).session.carData = carData;
    } else if (step === 'year') {
      if (value.toLowerCase() !== 'пропустить' && value.toLowerCase() !== 'skip') {
        const year = parseInt(value);
        if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1) {
          carData.year = year;
        }
      }
      await ctx.reply('Введите цвет автомобиля (необязательно, или отправьте "пропустить"):');
      (ctx as any).session.carData = carData;
    } else if (step === 'color') {
      if (value.toLowerCase() !== 'пропустить' && value.toLowerCase() !== 'skip') {
        carData.color = value;
      }
      await ctx.reply('Введите гос. номер (необязательно, или отправьте "пропустить"):');
      (ctx as any).session.carData = carData;
    } else if (step === 'licensePlate') {
      if (value.toLowerCase() !== 'пропустить' && value.toLowerCase() !== 'skip') {
        carData.licensePlate = value;
      }

      // Создаем автомобиль
      const user = userService.getUserByTelegramId(ctx.from!.id.toString());
      if (!user) {
        await ctx.reply('Ошибка: пользователь не найден');
        return;
      }

      const car = await apiService.createCar({
        userId: user.id,
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        color: carData.color,
        licensePlate: carData.licensePlate,
      });

      (ctx as any).session.addingCar = false;
      (ctx as any).session.carData = {};

      await ctx.reply(
        `✅ Автомобиль "${car.brand} ${car.model}" успешно добавлен!`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
            ],
          },
        }
      );
    }
  } catch (error) {
    logger.error('Ошибка обработки ввода данных автомобиля', { error, step, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при добавлении автомобиля. Попробуйте позже.');
  }
}

