// Workspace state resolver
// Классифицирует рабочую область браузера для диагностики и будущего выбора профилей.
// Не меняет rules и не управляет сеткой напрямую.

import { WORKSPACE_STATE_LIMITS } from "./workspaceStateLimits.js";

export const WORKSPACE_STATES = {
  UNKNOWN: "unknown",
  EMPTY: "empty",
  TINY: "tiny",
  NARROW: "narrow",
  SHORT: "short",
  MEASURED: "measured"
};

export function resolveWorkspaceState(workspaceSnapshot, limits = WORKSPACE_STATE_LIMITS) {
  if (!workspaceSnapshot) {
    return WORKSPACE_STATES.UNKNOWN;
  }

  const width = toSafeSize(workspaceSnapshot.width);
  const height = toSafeSize(workspaceSnapshot.height);
  const narrowWidth = toSafeSize(limits.narrowWidth, WORKSPACE_STATE_LIMITS.narrowWidth);
  const shortHeight = toSafeSize(limits.shortHeight, WORKSPACE_STATE_LIMITS.shortHeight);

  if (width === 0 || height === 0) {
    return WORKSPACE_STATES.EMPTY;
  }

  if (width < narrowWidth && height < shortHeight) {
    return WORKSPACE_STATES.TINY;
  }

  if (width < narrowWidth) {
    return WORKSPACE_STATES.NARROW;
  }

  if (height < shortHeight) {
    return WORKSPACE_STATES.SHORT;
  }

  return WORKSPACE_STATES.MEASURED;
}

function toSafeSize(value, fallback = 0) {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? Math.max(number, 0) : fallback;
}
