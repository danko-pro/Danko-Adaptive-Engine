import { SIDEBAR_DOCKS, resolveSidebarDock } from "../contracts/sidebarDock.js";
import { normalizeSidebarElementContract } from "../contracts/sidebarElementContract.js";
import { SIDEBAR_STATES } from "../contracts/sidebarState.js";
import { resolveSidebarViewportModeFromMetrics } from "../adapters/resolveSidebarViewportModeFromMetrics.js";
import { resolveSidebarDockFromArea } from "../dock/resolveSidebarDock.js";
import { resolveSidebarFixedViewportLayout } from "../layout/resolveSidebarFixedViewportLayout.js";
import { resolveSidebarLayer, SIDEBAR_LAYERS } from "../layer/resolveSidebarLayer.js";
import { sidebarStateReservesSpace } from "../contracts/sidebarStatePolicy.js";

export function resolveSidebarReservedArea({ items = [], metrics = null, viewportMode = null } = {}) {
  const sourceItems = Array.isArray(items) ? items : [];
  const resolvedViewportMode = viewportMode ?? resolveSidebarViewportModeFromMetrics(metrics);
  const reservedArea = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  const participants = [];
  const metricsColumns = Number(metrics?.columns);
  const metricsRows = Number(metrics?.rows);

  for (const item of sourceItems) {
    if (!isSidebarItem(item)) {
      continue;
    }

    if (resolveSidebarLayer(item) !== SIDEBAR_LAYERS.LAYOUT) {
      continue;
    }

    if (!sidebarStateReservesSpace(item)) {
      continue;
    }

    const dock = resolveDock(item, metrics);
    const sidebar = normalizeSidebarElementContract({
      item,
      dock,
      defaultDock: dock,
      defaultState: SIDEBAR_STATES.FIXED,
      syncExpandedArea: true
    });
    const viewportLayout = resolveSidebarFixedViewportLayout({
      sidebar,
      state: sidebar.state,
      viewportMode: resolvedViewportMode,
      metrics
    });
    const effectiveDock = viewportLayout.dock;
    const thickness = viewportLayout.reservedThickness;

    if (thickness < 1) {
      continue;
    }

    if (effectiveDock === SIDEBAR_DOCKS.LEFT) {
      reservedArea.left = Math.max(reservedArea.left, thickness);
    } else if (effectiveDock === SIDEBAR_DOCKS.RIGHT) {
      reservedArea.right = Math.max(reservedArea.right, thickness);
    } else if (effectiveDock === SIDEBAR_DOCKS.TOP) {
      reservedArea.top = Math.max(reservedArea.top, thickness);
    } else {
      reservedArea.bottom = Math.max(reservedArea.bottom, thickness);
    }

    participants.push({
      id: item?.id ?? null,
      dock: effectiveDock,
      thickness
    });
  }

  return {
    reservedArea: {
      left: clampSize(reservedArea.left, metricsColumns),
      right: clampSize(reservedArea.right, metricsColumns),
      top: clampSize(reservedArea.top, metricsRows),
      bottom: clampSize(reservedArea.bottom, metricsRows)
    },
    participants
  };
}

function resolveDock(item, metrics) {
  const explicitDock = resolveSidebarDock(item?.meta?.sidebar?.dock);

  if (item?.meta?.sidebar?.dock) {
    return explicitDock;
  }

  return resolveSidebarDockFromArea({
    area: item,
    metrics,
    fallbackDock: explicitDock
  });
}

function clampSize(value, limit) {
  const nextValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  if (!Number.isFinite(limit) || limit <= 0) {
    return Math.max(0, nextValue);
  }

  return Math.min(limit, Math.max(0, nextValue));
}

function isSidebarItem(item) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" ||
    (item?.meta?.sidebar && typeof item.meta.sidebar === "object")
  );
}
