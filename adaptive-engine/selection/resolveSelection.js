// Selection resolver
// Отвечает на вопрос: что находится в указанной grid cell.
// Не слушает DOM events и не меняет layout.

import { createGridCoordinateSystem } from "../coordinates/createGridCoordinateSystem.js";
import { normalizeLayoutItems } from "../layout/normalizeLayoutItems.js";
import { createSelectionResult } from "./createSelectionResult.js";
import { SELECTION_ERRORS } from "./selectionErrorCodes.js";
import { SELECTION_TYPES } from "./selectionTypes.js";
import { validateSelectionInput } from "./validateSelectionInput.js";

export function resolveSelection({ cell, items = [], metrics }) {
  const inputValidation = validateSelectionInput({ cell, metrics });

  if (!inputValidation.valid) {
    return createSelectionResult({
      reason: inputValidation.reason
    });
  }

  const normalizedCell = inputValidation.cell;
  const coordinates = createGridCoordinateSystem(metrics);

  if (!coordinates.isCellInside(normalizedCell.x, normalizedCell.y)) {
    return createSelectionResult({
      cell: normalizedCell,
      reason: SELECTION_ERRORS.OUT_OF_GRID
    });
  }

  const matchedItem = findTopMostItemAtCell(normalizeLayoutItems(items), normalizedCell);

  if (matchedItem) {
    return createSelectionResult({
      type: SELECTION_TYPES.AREA,
      cell: normalizedCell,
      itemId: matchedItem.id,
      item: matchedItem
    });
  }

  return createSelectionResult({
    type: SELECTION_TYPES.CELL,
    cell: normalizedCell
  });
}

function findTopMostItemAtCell(items, cell) {
  return [...items].reverse().find((item) => isCellInsideItem(cell, item)) ?? null;
}

function isCellInsideItem(cell, item) {
  return (
    cell.x >= item.x &&
    cell.y >= item.y &&
    cell.x < item.x + item.w &&
    cell.y < item.y + item.h
  );
}
