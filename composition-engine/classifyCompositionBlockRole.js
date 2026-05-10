import { COMPOSITION_BLOCK_ROLES } from "./contracts/compositionBlockRoles.js";
import {
  WORKSPACE_HORIZONTAL_ZONES,
  WORKSPACE_SECTORS
} from "./contracts/workspaceZones.js";

export function classifyCompositionBlockRole(block) {
  if (block.workspacePosition?.spans?.fullWidth) {
    return COMPOSITION_BLOCK_ROLES.FULL_WIDTH;
  }

  if (block.workspacePosition?.spans?.fullHeight) {
    return COMPOSITION_BLOCK_ROLES.FULL_HEIGHT;
  }

  if (isCornerBound(block.workspacePosition?.touches)) {
    return COMPOSITION_BLOCK_ROLES.CORNER_BOUND;
  }

  if (isEdgeBound(block.workspacePosition?.touches)) {
    return COMPOSITION_BLOCK_ROLES.EDGE_BOUND;
  }

  if (isUtilityBlock(block)) {
    return COMPOSITION_BLOCK_ROLES.UTILITY;
  }

  if (block.workspacePosition?.sector === WORKSPACE_SECTORS.MIDDLE_CENTER) {
    return COMPOSITION_BLOCK_ROLES.CENTER_CONTENT;
  }

  if (block.contentSchema) {
    return COMPOSITION_BLOCK_ROLES.CONTENT_BLOCK;
  }

  if (block.workspacePosition?.horizontal === WORKSPACE_HORIZONTAL_ZONES.CENTER) {
    return COMPOSITION_BLOCK_ROLES.CENTER_CONTENT;
  }

  return COMPOSITION_BLOCK_ROLES.UNKNOWN;
}

function isCornerBound(touches = {}) {
  return (touches.left || touches.right) && (touches.top || touches.bottom);
}

function isEdgeBound(touches = {}) {
  return touches.left || touches.right || touches.top || touches.bottom;
}

function isUtilityBlock(block) {
  const type = String(block.contentSchema?.type ?? "").toLowerCase();
  const smallArea = Number(block.area?.w) <= 2 && Number(block.area?.h) <= 2;
  return ["button", "chip", "status", "icon"].includes(type) || smallArea;
}
