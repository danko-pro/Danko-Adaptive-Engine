// Layout item normalizer
// Приводит один raw item к безопасной форме { id, x, y, w, h }.

import { createArea } from "../area/index.js";

export function normalizeLayoutItem(item) {
  const area = createArea(item);

  return {
    ...item,
    id: normalizeId(item?.id),
    ...area
  };
}

function normalizeId(id) {
  if (typeof id === "string") {
    return id.trim();
  }

  if (typeof id === "number" && Number.isFinite(id)) {
    return String(id);
  }

  return "";
}
