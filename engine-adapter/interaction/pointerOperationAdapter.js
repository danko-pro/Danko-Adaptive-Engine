import { OPERATION_TYPES } from "../../adaptive-engine/core/index.js";
import { resolveEventCell } from "../input/resolveEventCell.js";

export function createPointerInteraction({ event, type, handle = null, item, sourceItems, metrics }) {
  return {
    type,
    handle,
    pointerId: event.pointerId,
    sourceItems,
    startCell: resolveCanvasEventCell(event, metrics),
    startItem: {
      ...item
    }
  };
}

export function createPointerOperation({ event, interaction, metrics }) {
  const currentCell = resolveCanvasEventCell(event, metrics);

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
    area.x = currentCell.x;
    area.w = right - currentCell.x + 1;
  }

  if (handle.includes("e")) {
    area.w = currentCell.x - item.x + 1;
  }

  if (handle.includes("n")) {
    area.y = currentCell.y;
    area.h = bottom - currentCell.y + 1;
  }

  if (handle.includes("s")) {
    area.h = currentCell.y - item.y + 1;
  }

  return area;
}

function resolveCanvasEventCell(event, metrics) {
  const canvas = event.currentTarget.closest(".layout-canvas");

  return resolveEventCell(event, metrics, canvas);
}
