import { COMPOSITION_GROUP_TYPES } from "./contracts/compositionGroupTypes.js";
import { COMPOSITION_ISSUE_CODES } from "./contracts/compositionIssueCodes.js";
import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";
import { createCompositionIssue } from "./createCompositionIssue.js";

export function resolveCompositionGroups({ blocks, context }) {
  const rows = createVerticalRows(blocks);
  const groups = rows.map((row, index) => createCompositionGroup({ row, index, context }));
  const issues = [];
  const proposals = [];

  for (const group of groups) {
    if (!shouldWrapGroup(group, context.metrics)) {
      continue;
    }

    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.HORIZONTAL_GROUP_NEEDS_WRAP,
        message: "Горизонтальная группа слишком плотная для текущей ширины.",
        severity: COMPOSITION_ISSUE_SEVERITY.WARNING,
        blockId: group.blockIds[0] ?? null,
        details: {
          groupId: group.id,
          blockIds: group.blockIds,
          width: group.bounds.w,
          columns: Number(context.metrics.columns)
        }
      })
    );

    proposals.push({
      type: "wrap-horizontal-group",
      groupId: group.id,
      blockIds: group.blockIds,
      message: "Разбить горизонтальную группу на несколько рядов при узкой рабочей области.",
      priority: "high"
    });
  }

  return {
    groups,
    issues,
    proposals
  };
}

function createVerticalRows(blocks) {
  const rows = [];
  const sortedBlocks = [...blocks].sort((left, right) => {
    if (Number(left.area.y) !== Number(right.area.y)) {
      return Number(left.area.y) - Number(right.area.y);
    }

    return Number(left.area.x) - Number(right.area.x);
  });

  for (const block of sortedBlocks) {
    const row = rows.find((currentRow) => rangesOverlap(currentRow.top, currentRow.bottom, block.area.y, block.area.bottom));

    if (!row) {
      rows.push({
        top: Number(block.area.y),
        bottom: Number(block.area.bottom),
        blocks: [block]
      });
      continue;
    }

    row.top = Math.min(row.top, Number(block.area.y));
    row.bottom = Math.max(row.bottom, Number(block.area.bottom));
    row.blocks.push(block);
  }

  return rows.map((row) => ({
    ...row,
    blocks: row.blocks.sort((left, right) => Number(left.area.x) - Number(right.area.x))
  }));
}

function createCompositionGroup({ row, index, context }) {
  const bounds = getGroupBounds(row.blocks);
  const fullWidth = row.blocks.length === 1 && row.blocks[0].edges.fullWidth;
  const type = fullWidth
    ? COMPOSITION_GROUP_TYPES.FULL_WIDTH_BAND
    : row.blocks.length > 1
      ? COMPOSITION_GROUP_TYPES.HORIZONTAL_ROW
      : COMPOSITION_GROUP_TYPES.SINGLE_BLOCK;

  return {
    id: `group-${index + 1}`,
    type,
    blockIds: row.blocks.map((block) => block.id),
    roles: row.blocks.map((block) => block.role),
    contentTypes: row.blocks.map((block) => String(block.contentSchema?.type ?? "unknown")),
    bounds,
    density: getGroupDensity({ blocks: row.blocks, bounds, metrics: context.metrics })
  };
}

function getGroupBounds(blocks) {
  const left = Math.min(...blocks.map((block) => Number(block.area.x)));
  const top = Math.min(...blocks.map((block) => Number(block.area.y)));
  const right = Math.max(...blocks.map((block) => Number(block.area.right)));
  const bottom = Math.max(...blocks.map((block) => Number(block.area.bottom)));

  return {
    x: left,
    y: top,
    w: right - left + 1,
    h: bottom - top + 1,
    right,
    bottom
  };
}

function getGroupDensity({ blocks, bounds, metrics }) {
  const columns = Math.max(1, Number(metrics.columns));
  const occupiedCells = blocks.reduce((sum, block) => sum + Number(block.area.w) * Number(block.area.h), 0);
  const boundsCells = Math.max(1, Number(bounds.w) * Number(bounds.h));

  return {
    widthRatio: round(bounds.w / columns),
    fillRatio: round(occupiedCells / boundsCells),
    blockCount: blocks.length
  };
}

function shouldWrapGroup(group, metrics) {
  if (group.type !== COMPOSITION_GROUP_TYPES.HORIZONTAL_ROW) {
    return false;
  }

  const columns = Math.max(1, Number(metrics.columns));

  return group.blockIds.length >= 3 && group.bounds.w >= Math.floor(columns * 0.75);
}

function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return Number(firstStart) <= Number(secondEnd) && Number(secondStart) <= Number(firstEnd);
}

function round(value) {
  return Math.round(Number(value) * 100) / 100;
}
