import { Context } from 'telegraf';
import apiService from '../services/apiService';
import userService from '../services/userService';
import logger from '../config/logger';
import { safeAnswerCb } from '../utils/telegrafUtils';

/**
 * Обработчик просмотра автомобилей пользователя
 */
export async function handleMyCars(ctx: Context) {
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

    await ctx.reply('⏳ Загружаю ваши автомобили...');

    const cars = await apiService.getUserCars(user.id);

    if (cars.length === 0) {
      await ctx.reply('У вас пока нет сохраненных автомобилей.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '➕ Добавить автомобиль', callback_data: 'add_car' }],
            [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
          ],
        },
      });
      return;
    }

    let message = '🚗 Ваши автомобили:\n\n';

    cars.forEach((car, index) => {
      message += `${index + 1}. ${car.brand} ${car.model}`;
      if (car.year) {
        message += ` (${car.year} г.)`;
      }
      if (car.color) {
        message += ` - ${car.color}`;
      }
      if (car.licensePlate) {
        message += ` ${car.licensePlate}`;
      }
      message += '\n';
    });

    const keyboard = [
      [{ text: '🗑️ Удалить автомобиль', callback_data: 'delete_car_list' }],
      [{ text: '➕ Добавить автомобиль', callback_data: 'add_car' }],
      [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
    ];

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    logger.error('Ошибка получения автомобилей', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке автомобилей. Попробуйте позже.');
  }
}

/**
 * Обработчик показа списка автомобилей для удаления
 */
export async function handleDeleteCarList(ctx: Context) {
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

    const cars = await apiService.getUserCars(user.id);

    if (cars.length === 0) {
      await ctx.reply('У вас нет автомобилей для удаления.');
      return;
    }

    const message = '🗑️ Выберите автомобиль для удаления:\n\n';

    const keyboard= [];

    cars.forEach((car) => {
      let carText = `${car.brand} ${car.model}`;
      if (car.year) {
        carText += ` (${car.year} г.)`;
      }
      if (car.color) {
        carText += ` - ${car.color}`;
      }
      if (car.licensePlate) {
        carText += ` ${car.licensePlate}`;
      }

      keyboard.push([
        { text: `🗑️ ${carText}`, callback_data: `delete_car_${car.id}` },
      ]);
    });

    keyboard.push([{ text: '◀️ Назад', callback_data: 'my_cars' }]);

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    logger.error('Ошибка получения списка автомобилей для удаления', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

/**
 * Обработчик удаления автомобиля
 */
export async function handleDeleteCar(ctx: Context, carId: string) {
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

    // Получаем список автомобилей пользователя для проверки
    const cars = await apiService.getUserCars(user.id);
    const car = cars.find((c) => c.id === carId);

    if (!car) {
      await ctx.reply('Автомобиль не найден или у вас нет доступа к нему.');
      return;
    }

    // Удаляем автомобиль
    await apiService.deleteCar(carId);

    await ctx.reply(`✅ Автомобиль ${car.brand} ${car.model} успешно удален.`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '◀️ К списку автомобилей', callback_data: 'my_cars' }],
          [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
        ],
      },
    });
  } catch (error) {
    logger.error('Ошибка удаления автомобиля', { error, carId, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при удалении автомобиля. Попробуйте позже.');
  }
}

