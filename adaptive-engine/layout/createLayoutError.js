// Layout error factory
// Создает единый формат ошибки layout-слоя.

export function createLayoutError(type, options = {}) {
  return {
    type,
    itemId: options.itemId ?? null,
    itemIds: options.itemIds ?? [],
    details: options.details ?? {}
  };
}
