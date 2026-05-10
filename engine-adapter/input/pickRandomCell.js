import { isCellInside } from "./resolvePointerCell.js";

export function pickRandomCell(metrics, currentCell = null) {
  if (currentCell && isCellInside(currentCell, metrics)) {
    return currentCell;
  }

  return {
    x: randomTrack(metrics.columns),
    y: randomTrack(metrics.rows)
  };
}

function randomTrack(max) {
  return Math.max(Math.floor(Math.random() * max) + 1, 1);
}
