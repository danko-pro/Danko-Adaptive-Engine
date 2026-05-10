import { NAVIGATION_PLACEMENTS } from "./contracts/navigationPlacements.js";
import { NAVIGATION_STATES } from "./contracts/navigationStates.js";

export function createNavigationContext(input = {}) {
  const metrics = normalizeMetrics(input.metrics);
  const pages = normalizeList(input.pages);
  const routes = normalizeList(input.routes);
  const workspaces = normalizeList(input.workspaces);
  const navigation = normalizeNavigation(input.navigation);
  const shell = normalizeShell(input.shell);
  const usableWorkspace = normalizeUsableWorkspace(input.usableWorkspace);

  return {
    enabled: input.enabled !== false,
    activePageId: normalizeId(input.activePageId),
    activeRouteId: normalizeId(input.activeRouteId ?? input.activeRoute),
    activeWorkspaceId: normalizeId(input.activeWorkspaceId),
    metrics,
    pages,
    routes,
    workspaces,
    navigation,
    shell,
    usableWorkspace
  };
}

function normalizeMetrics(metrics = {}) {
  return {
    columns: Math.max(1, Math.floor(Number(metrics.columns) || 1)),
    rows: Math.max(1, Math.floor(Number(metrics.rows) || 1))
  };
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && item.id !== undefined && item.id !== null)
    .map((item) => ({
      ...item,
      id: String(item.id)
    }));
}

function normalizeNavigation(navigation = {}) {
  const items = normalizeList(navigation.items);

  return {
    id: normalizeId(navigation.id) ?? "navigation",
    state: navigation.state ?? NAVIGATION_STATES.HIDDEN,
    placement: navigation.placement ?? NAVIGATION_PLACEMENTS.LEFT,
    scope: navigation.scope ?? "global",
    items
  };
}

function normalizeShell(shell = {}) {
  return {
    reservedArea: normalizeReservedArea(shell.reservedArea)
  };
}

function normalizeReservedArea(reservedArea = {}) {
  return {
    left: Math.max(0, Math.floor(Number(reservedArea.left) || 0)),
    right: Math.max(0, Math.floor(Number(reservedArea.right) || 0)),
    top: Math.max(0, Math.floor(Number(reservedArea.top) || 0)),
    bottom: Math.max(0, Math.floor(Number(reservedArea.bottom) || 0))
  };
}

function normalizeUsableWorkspace(usableWorkspace) {
  if (!usableWorkspace || typeof usableWorkspace !== "object") {
    return null;
  }

  return {
    x: Math.max(1, Math.floor(Number(usableWorkspace.x) || 1)),
    y: Math.max(1, Math.floor(Number(usableWorkspace.y) || 1)),
    columns: Math.max(0, Math.floor(Number(usableWorkspace.columns) || 0)),
    rows: Math.max(0, Math.floor(Number(usableWorkspace.rows) || 0))
  };
}

function normalizeId(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  return String(value);
}
