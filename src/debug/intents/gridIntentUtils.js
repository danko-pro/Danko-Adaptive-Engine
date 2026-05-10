import {
  formatItemLabel,
  SELECTION_TYPES
} from "../../../engine-adapter/index.js";

export function createIntentStatus(type, message) {
  return {
    type,
    message
  };
}

export function formatIntentStatusMessage(status, selection) {
  if (
    status?.message?.startsWith("Создан блок cell-") &&
    selection?.type === SELECTION_TYPES.AREA
  ) {
    const label = formatItemLabel(selection.item);

    if (label) {
      return `Создан блок "${label}".`;
    }
  }

  return status.message;
}

export function getIntentStatusClassName(status) {
  return status?.type === "error"
    ? "grid-intent-cell-status is-error"
    : "grid-intent-cell-status";
}

export function getSelectedCellClassName(status) {
  return status?.type === "error"
    ? "grid-intent-selected-cell is-error"
    : "grid-intent-selected-cell";
}

export function isMainPointer(event) {
  return event.button === 0;
}

export function isCellInsideArea(cell, area) {
  return (
    cell.x >= area.x &&
    cell.x < area.x + area.w &&
    cell.y >= area.y &&
    cell.y < area.y + area.h
  );
}

export function getEditorPosition(editor, metrics, layerElement) {
  const width = 228;
  const height = 42;
  const layerRect = layerElement?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
  const areaWidth = editor.size.w * metrics.cellSize;
  const left = (editor.cell.x - 1) * metrics.cellSize + (areaWidth - width) / 2;
  const top = (editor.cell.y + editor.size.h - 1) * metrics.cellSize + 8;
  const viewportWidth = globalThis.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = globalThis.innerHeight || document.documentElement.clientHeight;
  const maxLeft = Math.max(8, viewportWidth - width - 8);
  const maxTop = Math.max(8, viewportHeight - height - 8);

  return {
    left: `${Math.min(Math.max(8, layerRect.left + left), maxLeft)}px`,
    top: `${Math.min(Math.max(8, layerRect.top + top), maxTop)}px`
  };
}
