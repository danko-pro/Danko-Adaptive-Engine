// Создание operation
// Приводит raw operation к стабильной форме.

export function createOperation(operation = {}) {
  return {
    type: normalizeString(operation.type),
    targetId: normalizeString(operation.targetId),
    payload: isObject(operation.payload) ? { ...operation.payload } : {},
    meta: isObject(operation.meta) ? { ...operation.meta } : {}
  };
}

function normalizeString(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
