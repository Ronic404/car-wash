import { Context } from 'telegraf';
import { Scenes } from 'telegraf';
import { handleViewSlots, handleSelectSlot } from './slotsHandler';
import { handleSelectCar } from './carHandler';
import { handleSelectService, handleMyBookings } from './bookingHandler';
import { handleMyCars, handleDeleteCar, handleDeleteCarList } from './carsHandler';
import { handleViewServices, handleSelectCategoryForPrice, handleViewPriceByCategory } from './servicesHandler';
import logger from '../config/logger';
import { isCallbackQueryWithData } from '../types/telegram';

/**
 * Обработчик всех callback запросов
 */
export async function handleCallback(ctx: Context) {
  try {
    const callbackData = isCallbackQueryWithData(ctx.callbackQuery)
      ? ctx.callbackQuery.data
      : undefined;

    if (!callbackData) {
      return;
    }

    // Главное меню
    if (callbackData === 'back_to_menu') {
      const telegramUser = ctx.from;
      if (!telegramUser) {
        return;
      }

      await ctx.answerCbQuery();
      await ctx.reply('Главное меню:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📅 Посмотреть доступные слоты', callback_data: 'view_slots' },
            ],
            [
              { text: '💰 Прайс услуг', callback_data: 'view_services' },
            ],
            [
              { text: '🚗 Мои автомобили', callback_data: 'my_cars' },
              { text: '📋 Мои записи', callback_data: 'my_bookings' },
            ],
          ],
        },
      });
      return;
    }

    // Просмотр слотов
    if (callbackData === 'view_slots') {
      await handleViewSlots(ctx);
      return;
    }

    // Просмотр прайса услуг
    if (callbackData === 'view_services') {
      await handleViewServices(ctx);
      return;
    }

    // Выбор категории для точного прайса
    if (callbackData === 'select_category_for_price') {
      await handleSelectCategoryForPrice(ctx);
      return;
    }

    // Просмотр прайса для выбранной категории
    if (callbackData.startsWith('view_price_by_category_')) {
      const categoryId = callbackData.replace('view_price_by_category_', '');
      await handleViewPriceByCategory(ctx, categoryId);
      return;
    }

    // Выбор слота
    if (callbackData.startsWith('select_slot_')) {
      const slotId = callbackData.replace('select_slot_', '');
      await handleSelectSlot(ctx, slotId);
      return;
    }

    // Мои автомобили
    if (callbackData === 'my_cars') {
      await handleMyCars(ctx);
      return;
    }

    // Добавление автомобиля - вход в сцену
    if (callbackData === 'add_car') {
      await ctx.answerCbQuery();
      await (ctx as Scenes.SceneContext).scene.enter('addCar');
      return;
    }

    // Выбор автомобиля
    if (callbackData.startsWith('select_car_')) {
      const carId = callbackData.replace('select_car_', '');
      await handleSelectCar(ctx, carId);
      return;
    }

    // Показать список автомобилей для удаления
    if (callbackData === 'delete_car_list') {
      await handleDeleteCarList(ctx);
      return;
    }

    // Удаление автомобиля
    if (callbackData.startsWith('delete_car_')) {
      const carId = callbackData.replace('delete_car_', '');
      await handleDeleteCar(ctx, carId);
      return;
    }

    // Выбор услуги
    if (callbackData.startsWith('select_service_')) {
      const parts = callbackData.replace('select_service_', '').split('_');
      const serviceId = parts[0];
      const carId = parts[1];
      const slotId = parts[2];
      await handleSelectService(ctx, serviceId, carId, slotId);
      return;
    }

    // Мои записи
    if (callbackData === 'my_bookings') {
      await handleMyBookings(ctx);
      return;
    }

    logger.warn('Неизвестный callback', { callbackData, userId: ctx.from?.id });
  } catch (error) {
    logger.error('Ошибка обработки callback', { error, userId: ctx.from?.id });
    await ctx.answerCbQuery('Произошла ошибка');
  }
}

