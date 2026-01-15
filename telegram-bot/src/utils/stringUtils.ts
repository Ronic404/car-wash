/**
 * Функция для капитализации первой буквы строки
 * Делает первую букву заглавной, остальные - строчными
 * 
 * @param str - строка для капитализации
 * @returns строка с заглавной первой буквой
 * 
 * @example
 * capitalizeFirstLetter('toyota') // 'Toyota'
 * capitalizeFirstLetter('BMW') // 'Bmw'
 * capitalizeFirstLetter('mercedes-benz') // 'Mercedes-benz'
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Русская плюрализация по числу (1/2-4/5-0), с учетом исключения 11-14.
 *
 * @example
 * pluralizeRu(1, 'место', 'места', 'мест') // 'место'
 * pluralizeRu(2, 'место', 'места', 'мест') // 'места'
 * pluralizeRu(5, 'место', 'места', 'мест') // 'мест'
 * pluralizeRu(21, 'место', 'места', 'мест') // 'место'
 */
export function pluralizeRu(count: number, one: string, few: string, many: string) {
  const n = Math.abs(count);
  const mod100 = n % 100;
  const mod10 = n % 10;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
