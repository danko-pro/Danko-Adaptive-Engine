import {
  WORKSPACE_HORIZONTAL_ZONES,
  WORKSPACE_SECTORS,
  WORKSPACE_VERTICAL_ZONES
} from "../contracts/workspaceZones.js";

export function classifyWorkspacePosition({ area, zones }) {
  const centerX = Number(area.x) + (Number(area.w) - 1) / 2;
  const centerY = Number(area.y) + (Number(area.h) - 1) / 2;
  const horizontal = resolveHorizontalZone(centerX, zones);
  const vertical = resolveVerticalZone(centerY, zones);
  const sector = resolveSector({ horizontal, vertical });

  return {
    horizontal,
    vertical,
    sector,
    center: {
      x: centerX,
      y: centerY
    },
    touches: {
      left: Number(area.x) === 1,
      right: Number(area.right) === Number(zones.columns),
      top: Number(area.y) === 1,
      bottom: Number(area.bottom) === Number(zones.rows)
    },
    spans: {
      fullWidth: Number(area.x) === 1 && Number(area.right) === Number(zones.columns),
      fullHeight: Number(area.y) === 1 && Number(area.bottom) === Number(zones.rows)
    }
  };
}

function resolveHorizontalZone(centerX, zones) {
  if (centerX <= zones.horizontal.left.end) {
    return WORKSPACE_HORIZONTAL_ZONES.LEFT;
  }

  if (centerX >= zones.horizontal.right.start) {
    return WORKSPACE_HORIZONTAL_ZONES.RIGHT;
  }

  return WORKSPACE_HORIZONTAL_ZONES.CENTER;
}

function resolveVerticalZone(centerY, zones) {
  if (centerY <= zones.vertical.top.end) {
    return WORKSPACE_VERTICAL_ZONES.TOP;
  }

  if (centerY >= zones.vertical.bottom.start) {
    return WORKSPACE_VERTICAL_ZONES.BOTTOM;
  }

  return WORKSPACE_VERTICAL_ZONES.MIDDLE;
}

function resolveSector({ horizontal, vertical }) {
  const key = `${String(vertical).toUpperCase()}_${String(horizontal).toUpperCase()}`;
  return WORKSPACE_SECTORS[key] ?? `${vertical}-${horizontal}`;
}
