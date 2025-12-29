import { Context } from 'telegraf';
import { Scenes } from 'telegraf';
import {
  handleViewSlots,
  handleSelectServiceForSlots,
  handleSelectTime,
  handleSelectCarForTime,
  handleSelectPostForTime,
  finalizeBookingFromSession,
} from './slotsHandler';
import { handleMyBookings } from './myBookingsHandler';
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

    // Новый поток слотов: услуга -> время -> авто
    if (callbackData.startsWith('select_service_for_slots_')) {
      const serviceId = callbackData.replace('select_service_for_slots_', '');
      await handleSelectServiceForSlots(ctx, serviceId);
      return;
    }

    if (callbackData.startsWith('select_time_')) {
      const idx = callbackData.replace('select_time_', '');
      await handleSelectTime(ctx, idx);
      return;
    }

    if (callbackData.startsWith('select_post_')) {
      const rest = callbackData.replace('select_post_', '');
      const [groupIdx, postId] = rest.split('_');
      if (!groupIdx || !postId) {
        await ctx.answerCbQuery('Ошибка');
        return;
      }
      await handleSelectPostForTime(ctx, groupIdx, postId);
      return;
    }

    if (callbackData.startsWith('select_car_for_time_')) {
      const carId = callbackData.replace('select_car_for_time_', '');
      await handleSelectCarForTime(ctx, carId);
      return;
    }

    if (callbackData === 'booking_note_skip') {
      await ctx.answerCbQuery();
      await finalizeBookingFromSession(ctx, null);
      return;
    }

    if (callbackData === 'booking_note_cancel') {
      await ctx.answerCbQuery('Отменено');
      ctx.session ??= {};
      ctx.session.waitingBookingNote = false;
      ctx.session.selectedCarId = null;
      await ctx.reply('Отмена ввода комментария. Выберите время и пост заново.', {
        reply_markup: { inline_keyboard: [[{ text: '📅 Посмотреть доступные слоты', callback_data: 'view_slots' }]] },
      });
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

