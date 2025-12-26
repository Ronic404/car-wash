import type { Update } from 'telegraf/types';
import type { Context } from 'telegraf';
import type { CallbackQuery } from 'telegraf/types';

export function isCallbackQueryWithData(
  callbackQuery: Context['callbackQuery']
): callbackQuery is CallbackQuery.DataQuery {
  return (
    !!callbackQuery &&
    'data' in callbackQuery &&
    typeof (callbackQuery as { data?: unknown }).data === 'string'
  );
}

export function getTextFromContext(ctx: Context): string | undefined {
  const msg = (ctx.message as unknown) as { text?: unknown } | undefined;
  return typeof msg?.text === 'string' ? msg.text : undefined;
}


