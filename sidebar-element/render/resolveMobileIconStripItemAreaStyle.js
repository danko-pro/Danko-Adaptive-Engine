export function resolveMobileIconStripItemAreaStyle(contentItem) {
  const x = normalizeGridNumber(contentItem?.x, 1);
  const y = normalizeGridNumber(contentItem?.y, 1);
  const w = normalizeGridSize(contentItem?.w, 1);
  const h = normalizeGridSize(contentItem?.h, 1);

  return {
    gridColumn: `${x} / span ${w}`,
    gridRow: `${y} / span ${h}`
  };
}

function normalizeGridNumber(value, fallback) {
  const number = Math.round(Number(value));

  return Number.isFinite(number) ? Math.max(1, number) : fallback;
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}
