import { Context } from 'telegraf';
import apiService from '../services/apiService';
import logger from '../config/logger';
import { safeAnswerCb } from '../utils/telegrafUtils';

/**
 * Обработчик выбора категории для просмотра точного прайса
 */
export async function handleSelectCategoryForPrice(ctx: Context) {
  try {
    await safeAnswerCb(ctx);

    const categories = await apiService.getActiveCategories();

    if (categories.length === 0) {
      await ctx.reply('К сожалению, нет доступных категорий автомобилей.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '◀️ Назад к прайсу', callback_data: 'view_services' }],
          ],
        },
      });
      return;
    }

    const keyboard = categories.map((category) => [
      {
        text: category.name,
        callback_data: `view_price_by_category_${category.id}`,
      },
    ]);

    keyboard.push([{ text: '◀️ Назад к прайсу', callback_data: 'view_services' }]);

    await ctx.reply('🚗 Выберите категорию вашего автомобиля:', {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    logger.error('Ошибка получения категорий', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

/**
 * Обработчик просмотра прайса для выбранной категории
 */
export async function handleViewPriceByCategory(ctx: Context, categoryId: string) {
  try {
    await safeAnswerCb(ctx);

    await ctx.reply('⏳ Загружаю прайс для выбранной категории...');

    const [services, categories] = await Promise.all([
      apiService.getActiveServices(),
      apiService.getActiveCategories(),
    ]);

    const category = categories.find((c) => c.id === categoryId);

    if (!category) {
      await ctx.reply('Категория не найдена.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '◀️ Назад к прайсу', callback_data: 'view_services' }],
          ],
        },
      });
      return;
    }

    if (services.length === 0) {
      await ctx.reply('К сожалению, сейчас нет доступных услуг.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '◀️ Назад к прайсу', callback_data: 'view_services' }],
          ],
        },
      });
      return;
    }

    let message = `💰 Прайс услуг для категории "${category.name}":\n\n`;

    services.forEach((service, index) => {
      message += `${index + 1}. ${service.name}\n`;
      if (service.description) {
        message += `   ${service.description}\n`;
      }

      // Ищем цену для выбранной категории
      const servicePrices = service.servicePrices || [];
      const priceForCategory = servicePrices.find((sp) => sp.categoryId === categoryId);

      if (priceForCategory) {
        message += `   💵 Цена: ${priceForCategory.price}₽\n`;
        message += `   ⏱ Длительность: ${service.duration} мин.\n\n`;
      } else {
        message += `   💵 Цена: не указана для данной категории\n`;
        message += `   ⏱ Длительность: ${service.duration} мин.\n\n`;
      }
    });

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔍 Выбрать другую категорию', callback_data: 'select_category_for_price' }],
          [{ text: '◀️ Назад к прайсу', callback_data: 'view_services' }],
          [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
        ],
      },
    });
  } catch (error) {
    logger.error('Ошибка получения прайса по категории', { error, categoryId, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке прайса. Попробуйте позже.');
  }
}

/**
 * Обработчик просмотра прайса услуг
 */
export async function handleViewServices(ctx: Context) {
  try {
    await safeAnswerCb(ctx);

    await ctx.reply('⏳ Загружаю прайс услуг...');

    const services = await apiService.getActiveServices();

    if (services.length === 0) {
      await ctx.reply('К сожалению, сейчас нет доступных услуг.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }],
          ],
        },
      });
      return;
    }

    let message = '💰 Прайс услуг:\n\n';

    services.forEach((service, index) => {
      message += `${index + 1}. ${service.name}\n`;
      if (service.description) {
        message += `   ${service.description}\n`;
      }

      // Обрабатываем цены из servicePrices
      const servicePrices = service.servicePrices || [];
      
      if (servicePrices.length === 0) {
        message += `   💵 Цена: не указана\n`;
        message += `   ⏱ Длительность: ${service.duration} мин.\n\n`;
      } else if (servicePrices.length === 1) {
        // Если одна цена - показываем её
        const price = servicePrices[0];
        message += `   💵 Цена: ${price.price}₽\n`;
        message += `   ⏱ Длительность: ${service.duration} мин.\n\n`;
      } else {
        // Если несколько цен - показываем диапазон
        const prices = servicePrices.map((sp) => sp.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        // Форматируем цену
        const priceText = minPrice === maxPrice 
          ? `${minPrice}₽` 
          : `${minPrice}₽ - ${maxPrice}₽`;
        
        message += `   💵 Цена: ${priceText}\n`;
        message += `   ⏱ Длительность: ${service.duration} мин.\n\n`;
      }
    });

    // Получаем категории для выбора
    const categories = await apiService.getActiveCategories();
    
    const keyboard = [];
    
    // Если есть категории и у услуг есть разные цены для разных категорий
    const hasMultiplePrices = services.some((service) => {
      const servicePrices = service.servicePrices || [];
      return servicePrices.length > 1;
    });
    
    if (categories.length > 0 && hasMultiplePrices) {
      keyboard.push([{ text: '🔍 Выбрать категорию авто для точного прайса', callback_data: 'select_category_for_price' }]);
    }
    
    keyboard.push([{ text: '◀️ Главное меню', callback_data: 'back_to_menu' }]);

    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    logger.error('Ошибка получения прайса услуг', { error, userId: ctx.from?.id });
    await ctx.reply('Произошла ошибка при загрузке прайса. Попробуйте позже.');
  }
}

