import { OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import { resolveEventCell } from "../input/resolveEventCell.js";

export function createPointerInteraction({ event, type, handle = null, item, sourceItems, metrics }) {
  const canvasElement = resolveCanvasElement(event);

  return {
    type,
    handle,
    pointerId: event.pointerId,
    canvasElement,
    pointerCaptureElement: event.currentTarget ?? null,
    sourceItems,
    startCell: resolveCanvasEventCell(event, metrics, canvasElement),
    startItem: {
      ...item
    }
  };
}

export function createPointerOperation({ event, interaction, metrics }) {
  const currentCell = resolveCanvasEventCell(event, metrics, interaction?.canvasElement);

  if (!currentCell || !interaction?.startCell) {
    return null;
  }

  const dx = currentCell.x - interaction.startCell.x;
  const dy = currentCell.y - interaction.startCell.y;

  if (interaction.type === "move") {
    return {
      type: OPERATION_TYPES.MOVE_AREA,
      targetId: interaction.startItem.id,
      payload: {
        x: interaction.startItem.x + dx,
        y: interaction.startItem.y + dy
      }
    };
  }

  return {
    type: OPERATION_TYPES.SET_AREA,
    targetId: interaction.startItem.id,
    payload: resizeArea(interaction.startItem, interaction.handle, currentCell, dx, dy)
  };
}

function resizeArea(item, handle, currentCell, dx, dy) {
  const area = {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
  const right = item.x + item.w - 1;
  const bottom = item.y + item.h - 1;

  if (handle.includes("w")) {
    // Западная грань не может перейти правее старой восточной грани.
    area.x = Math.min(currentCell.x, right);
    area.w = right - area.x + 1;
  }

  if (handle.includes("e")) {
    // Восточная грань не может перейти левее старой западной грани.
    area.w = Math.max(currentCell.x, item.x) - item.x + 1;
  }

  if (handle.includes("n")) {
    // Северная грань не может перейти ниже старой южной грани.
    area.y = Math.min(currentCell.y, bottom);
    area.h = bottom - area.y + 1;
  }

  if (handle.includes("s")) {
    // Южная грань не может перейти выше старой северной грани.
    area.h = Math.max(currentCell.y, item.y) - item.y + 1;
  }

  return area;
}

function resolveCanvasEventCell(event, metrics, canvasElement = null) {
  const canvas = canvasElement ?? resolveCanvasElement(event);

  return resolveEventCell(event, metrics, canvas);
}

function resolveCanvasElement(event) {
  return event.currentTarget?.closest?.(".layout-canvas") ?? null;
}
