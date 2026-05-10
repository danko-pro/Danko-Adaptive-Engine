// Layout items normalizer
// Приводит массив raw layout items к безопасной форме перед валидацией.

import { normalizeLayoutItem } from "./normalizeLayoutItem.js";

export function normalizeLayoutItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(normalizeLayoutItem);
}
