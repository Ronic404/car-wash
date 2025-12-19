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
