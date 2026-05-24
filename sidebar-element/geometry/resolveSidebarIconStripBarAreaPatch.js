import { normalizeIconStripBarArea } from "../contracts/iconStripLayout.js";

export function resolveSidebarIconStripBarAreaPatch({ absoluteArea, metrics } = {}) {
  const normalized = normalizeIconStripBarArea(absoluteArea);

  if (!normalized) {
    return null;
  }

  const columns = normalizeGridSize(metrics?.columns, 1);
  const rows = normalizeGridSize(metrics?.rows, 1);
  let { x, y, w, h } = normalized;

  w = Math.min(Math.max(1, w), columns);
  h = Math.min(Math.max(1, h), rows);
  x = Math.max(1, Math.min(x, columns));
  y = Math.max(1, Math.min(y, rows));

  if (x + w - 1 > columns) {
    w = Math.max(1, columns - x + 1);
  }

  if (y + h - 1 > rows) {
    h = Math.max(1, rows - y + 1);
  }

  if (x + w - 1 > columns) {
    x = Math.max(1, columns - w + 1);
  }

  if (y + h - 1 > rows) {
    y = Math.max(1, rows - h + 1);
  }

  return { x, y, w, h };
}

function normalizeGridSize(value, fallback) {
  const number = Math.round(Number(value));

  if (!Number.isFinite(number) || number < 1) {
    return fallback;
  }

  return number;
}
