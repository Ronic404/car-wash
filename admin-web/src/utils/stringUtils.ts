/**
 * Русская плюрализация по числу (1/2-4/5-0), с учетом исключения 11-14.
 *
 * @example
 * pluralizeRu(1, 'пост', 'поста', 'постов') // 'пост'
 * pluralizeRu(2, 'пост', 'поста', 'постов') // 'поста'
 * pluralizeRu(5, 'пост', 'поста', 'постов') // 'постов'
 * pluralizeRu(21, 'пост', 'поста', 'постов') // 'пост'
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


