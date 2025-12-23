export function getErrorMessage(error: unknown, fallback = 'Ошибка'): string {
  return error instanceof Error ? error.message : fallback;
}


