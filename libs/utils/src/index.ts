export * from './custom-error';
export * from './docorators';
export * from './filters';
export * from './guards';
export * from './plain-to-instance';

/**
 * snake_case를 camelCase로 변환
 */
export const snakeToCamel = (snakeStr: string): string => {
  return snakeStr.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * camelCase를 snake_case로 변환
 */
export const camelToSnake = (camelStr: string): string => {
  return camelStr.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};
