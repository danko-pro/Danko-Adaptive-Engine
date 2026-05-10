// Layout items resolver
// Готовит layout items к отображению: normalize, validate, attach pixel rect.

import { resolveArea } from "../area/index.js";
import { prepareLayoutItems } from "./prepareLayoutItems.js";

export function resolveLayoutItems(items, metrics) {
  const preparedLayout = prepareLayoutItems(items, metrics);

  if (!preparedLayout.validation.valid) {
    return {
      valid: false,
      items: [],
      errors: preparedLayout.validation.errors
    };
  }

  return {
    valid: true,
    items: preparedLayout.items.map((item) => ({
      ...item,
      rect: resolveArea(item, metrics).rect
    })),
    errors: []
  };
}
