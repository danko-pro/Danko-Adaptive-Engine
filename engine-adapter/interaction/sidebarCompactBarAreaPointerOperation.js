import { resolveSidebarCompactBarAreaPatch } from "../../sidebar-element/index.js";
import {
  createPointerInteraction,
  createPointerOperation
} from "./pointerOperationAdapter.js";

export const SIDEBAR_COMPACT_BAR_AREA_POINTER_TYPES = {
  MOVE: "move",
  RESIZE: "resize"
};

export function createSidebarCompactBarAreaPointerInteraction({
  event,
  type = SIDEBAR_COMPACT_BAR_AREA_POINTER_TYPES.MOVE,
  handle = null,
  sidebarItem,
  renderInfo,
  sourceItems,
  metrics
} = {}) {
  const barArea = normalizeArea(renderInfo?.renderArea);

  if (!barArea) {
    return null;
  }

  return {
    ...createPointerInteraction({
      event,
      type,
      handle,
      item: {
        id: sidebarItem?.id,
        ...barArea
      },
      sourceItems,
      metrics
    }),
    sidebarItem,
    metrics,
    renderInfo,
    startBarArea: barArea
  };
}

export function createSidebarCompactBarAreaPointerMove({
  event,
  interaction,
  metrics
} = {}) {
  const operation = createPointerOperation({ event, interaction, metrics });

  if (!operation) {
    return null;
  }

  const absoluteArea = resolveAbsoluteAreaFromOperation({
    operation,
    startArea: interaction?.startBarArea
  });
  const barArea = resolveSidebarCompactBarAreaPatch({
    absoluteArea,
    metrics
  });

  if (!barArea) {
    return null;
  }

  return {
    absoluteArea,
    barArea
  };
}

function resolveAbsoluteAreaFromOperation({ operation, startArea }) {
  const area = normalizeArea(startArea);
  const payload = operation?.payload ?? {};

  if (!area) {
    return null;
  }

  return {
    x: payload.x ?? area.x,
    y: payload.y ?? area.y,
    w: payload.w ?? area.w,
    h: payload.h ?? area.h
  };
}

function normalizeArea(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const area = {
    x: normalizeGridNumber(value.x),
    y: normalizeGridNumber(value.y),
    w: normalizeGridNumber(value.w),
    h: normalizeGridNumber(value.h)
  };

  if ([area.x, area.y, area.w, area.h].some((number) => number === null)) {
    return null;
  }

  return {
    x: Math.max(1, area.x),
    y: Math.max(1, area.y),
    w: Math.max(1, area.w),
    h: Math.max(1, area.h)
  };
}

function normalizeGridNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.round(number) : null;
}
