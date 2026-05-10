// Создание ошибки operation
// Нормализует ошибку operation assistant.

export function createOperationError(type, options = {}) {
  return {
    type,
    operationType: options.operationType ?? null,
    targetId: options.targetId ?? null,
    details: options.details ?? {}
  };
}
