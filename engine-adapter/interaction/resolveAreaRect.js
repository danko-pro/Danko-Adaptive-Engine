export function resolveAreaRect(startCell, endCell) {
  if (!startCell || !endCell) {
    return null;
  }

  const x = Math.min(startCell.x, endCell.x);
  const y = Math.min(startCell.y, endCell.y);
  const right = Math.max(startCell.x, endCell.x);
  const bottom = Math.max(startCell.y, endCell.y);

  return {
    cell: { x, y },
    size: {
      w: right - x + 1,
      h: bottom - y + 1
    },
    x,
    y,
    w: right - x + 1,
    h: bottom - y + 1
  };
}
