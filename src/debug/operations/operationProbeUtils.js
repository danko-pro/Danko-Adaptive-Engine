import { formatItemLabel, SELECTION_TYPES } from "../../../engine-adapter/index.js";
import {
  formatMobileSidebarButtonSelection,
  formatSidebarContentItemSelection,
  isMobileSidebarButtonSelection,
  isSidebarContentItemSelection
} from "./operationInternalSelection.js";

export function isSelectedItem(selection, item) {
  return selection?.type === SELECTION_TYPES.AREA && String(selection.itemId) === String(item.id);
}

export function formatSelection(selection) {
  if (isSidebarContentItemSelection(selection)) {
    return `выбор: ${formatSidebarContentItemSelection(selection)}`;
  }

  if (isMobileSidebarButtonSelection(selection)) {
    return `выбор: ${formatMobileSidebarButtonSelection(selection)}`;
  }

  if (!selection?.cell) {
    return "выбор: нет";
  }

  const parts = [`ячейка ${selection.cell.x}:${selection.cell.y}`];

  if (selection.type === SELECTION_TYPES.AREA && selection.itemId) {
    const label = formatItemLabel(selection.item);

    if (label) {
      parts.push(`название: ${label}`);
    }

    if (label !== String(selection.itemId)) {
      parts.push(`id: ${selection.itemId}`);
    }
  }

  return `выбор: ${parts.join(" · ")}`;
}

export function isMainPointer(event) {
  return event.button === 0;
}

export function isTextInputEvent(event) {
  const tagName = event.target?.tagName;

  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}
