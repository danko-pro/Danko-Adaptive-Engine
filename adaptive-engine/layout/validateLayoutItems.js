// Layout items validator
// Проверяет набор будущих layout-блоков относительно текущей сетки.

import { validateGridArea } from "../coordinates/validateGridArea.js";
import { createLayoutError } from "./createLayoutError.js";
import { detectAreaCollision } from "./detectAreaCollision.js";
import { LAYOUT_ERRORS } from "./layoutErrorCodes.js";

export { LAYOUT_ERRORS };

export function validateLayoutItems(items, metrics) {
  const errors = [];
  const ids = new Set();
  const validItems = [];

  for (const item of items) {
    if (!item?.id) {
      errors.push(createLayoutError(LAYOUT_ERRORS.MISSING_ID, { details: { item } }));
      continue;
    }

    if (ids.has(item.id)) {
      errors.push(createLayoutError(LAYOUT_ERRORS.DUPLICATE_ID, { itemId: item.id }));
      continue;
    }

    ids.add(item.id);

    const areaResult = validateGridArea(item, metrics);

    if (!areaResult.valid) {
      errors.push(createLayoutError(areaResult.reason, { itemId: item.id }));
      continue;
    }

    validItems.push(item);
  }

  for (let index = 0; index < validItems.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < validItems.length; nextIndex += 1) {
      const firstItem = validItems[index];
      const secondItem = validItems[nextIndex];

      if (detectAreaCollision(firstItem, secondItem)) {
        errors.push(
          createLayoutError(LAYOUT_ERRORS.AREA_COLLISION, {
            itemIds: [firstItem.id, secondItem.id]
          })
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
