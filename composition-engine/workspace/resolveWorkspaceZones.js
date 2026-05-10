export function resolveWorkspaceZones(metrics) {
  const columns = Math.max(1, Math.floor(Number(metrics?.columns) || 1));
  const rows = Math.max(1, Math.floor(Number(metrics?.rows) || 1));

  const leftEnd = clampBandEnd(Math.floor(columns / 3), columns);
  const rightStart = clampBandStart(Math.floor((columns * 2) / 3) + 1, columns);
  const topEnd = clampBandEnd(Math.floor(rows / 3), rows);
  const bottomStart = clampBandStart(Math.floor((rows * 2) / 3) + 1, rows);

  return {
    columns,
    rows,
    horizontal: {
      left: { start: 1, end: leftEnd },
      center: { start: leftEnd + 1, end: rightStart - 1 },
      right: { start: rightStart, end: columns }
    },
    vertical: {
      top: { start: 1, end: topEnd },
      middle: { start: topEnd + 1, end: bottomStart - 1 },
      bottom: { start: bottomStart, end: rows }
    },
    center: {
      x: Math.ceil(columns / 2),
      y: Math.ceil(rows / 2)
    }
  };
}

function clampBandEnd(value, limit) {
  return Math.min(Math.max(1, value), limit);
}

function clampBandStart(value, limit) {
  return Math.min(Math.max(1, value), limit);
}
