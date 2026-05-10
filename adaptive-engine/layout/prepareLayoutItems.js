// Layout preparation facade
// Нормализует raw items и сразу валидирует результат.

import { normalizeLayoutItems } from "./normalizeLayoutItems.js";
import { validateLayoutItems } from "./validateLayoutItems.js";

export function prepareLayoutItems(items, metrics) {
  const normalizedItems = normalizeLayoutItems(items);
  const validation = validateLayoutItems(normalizedItems, metrics);

  return {
    items: normalizedItems,
    validation
  };
}
