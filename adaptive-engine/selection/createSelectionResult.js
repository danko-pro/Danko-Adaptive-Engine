// Selection result creator
// Нормализует ответ selection assistant.

import { SELECTION_TYPES } from "./selectionTypes.js";

export function createSelectionResult({
  type = SELECTION_TYPES.EMPTY,
  cell = null,
  itemId = null,
  item = null,
  reason = null,
  valid = reason === null
}) {
  return {
    valid,
    type,
    cell,
    itemId,
    item,
    reason
  };
}
