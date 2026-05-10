export function resolvePointerCell({ clientX, clientY, element, metrics }) {
  if (!element || !metrics) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const x = Math.floor((clientX - rect.left) / metrics.cellSize) + 1;
  const y = Math.floor((clientY - rect.top) / metrics.cellSize) + 1;

  if (!isCellInside({ x, y }, metrics)) {
    return null;
  }

  return { x, y };
}

export function isCellInside(cell, metrics) {
  return (
    cell?.x >= 1 &&
    cell?.y >= 1 &&
    cell.x <= metrics.columns &&
    cell.y <= metrics.rows
  );
}
