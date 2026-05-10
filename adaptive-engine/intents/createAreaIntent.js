// Намерение создания области
// Нормализует сырое намерение адаптера перед валидацией и разрешением.

import { INTENT_TYPES } from "./intentTypes.js";

export function createAreaIntent(input = {}) {
  return {
    type: normalizeString(input.type || INTENT_TYPES.CREATE_AREA_FROM_CELL),
    cell: normalizeCell(input.cell),
    size: normalizeSize(input.size),
    value: input.value ?? null,
    targetId: normalizeString(input.targetId),
    meta: isObject(input.meta) ? { ...input.meta } : {}
  };
}

function normalizeCell(cell) {
  if (!isObject(cell)) {
    return {
      x: null,
      y: null
    };
  }

  return {
    x: Number(cell.x),
    y: Number(cell.y)
  };
}

function normalizeSize(size) {
  if (!isObject(size)) {
    return {
      w: 1,
      h: 1
    };
  }

  return {
    w: size.w === undefined ? 1 : Number(size.w),
    h: size.h === undefined ? 1 : Number(size.h)
  };
}

function normalizeString(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
