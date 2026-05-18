export function createSidebarContentItemPointerInteraction({
  event,
  type = SIDEBAR_CONTENT_POINTER_TYPES.MOVE,
  handle = null,
  sidebarItem,
  contentItem,
  content,
  sourceItems,
  metrics
} = {}) {
  const gridElement = resolveSidebarContentGridElement(event);
  const startCell = resolveSidebarContentEventCell({ event, content, metrics, gridElement });

  if (!gridElement || !startCell || !contentItem?.id || !sidebarItem?.id) {
    return null;
  }

  return {
    type: resolveSidebarContentPointerType(type),
    handle,
    pointerId: event.pointerId,
    gridElement,
    pointerCaptureElement: event.currentTarget ?? null,
    sourceItems,
    metrics,
    sidebarItem,
    content,
    startCell,
    startItem: {
      ...contentItem
    }
  };
}

export function createSidebarContentItemPointerMove({
  event,
  interaction
} = {}) {
  const currentCell = resolveSidebarContentEventCell({
    event,
    content: interaction?.content,
    metrics: interaction?.metrics,
    gridElement: interaction?.gridElement
  });

  if (!currentCell || !interaction?.startCell || !interaction?.startItem) {
    return null;
  }

  const grid = normalizeGrid(interaction.content?.grid);
  const dx = currentCell.x - interaction.startCell.x;
  const dy = currentCell.y - interaction.startCell.y;
  const area = interaction.type === SIDEBAR_CONTENT_POINTER_TYPES.RESIZE
    ? resizeSidebarContentArea(interaction.startItem, interaction.handle, currentCell, grid)
    : moveSidebarContentArea(interaction.startItem, { dx, dy }, grid);

  return {
    sidebarItem: interaction.sidebarItem,
    contentItem: interaction.startItem,
    area
  };
}

export function resolveSidebarContentEventCell({
  event,
  content,
  metrics,
  gridElement
} = {}) {
  return resolveSidebarContentPointerCell({
    clientX: event?.clientX,
    clientY: event?.clientY,
    content,
    metrics,
    gridElement
  });
}

export function resolveSidebarContentPointerCell({
  clientX,
  clientY,
  content,
  metrics,
  gridElement
} = {}) {
  if (!gridElement || !content?.grid) {
    return null;
  }

  const grid = normalizeGrid(content.grid);
  const rect = gridElement.getBoundingClientRect();
  const cellWidth = resolveSidebarContentCellSize(rect?.width, grid.columns);
  const cellHeight = resolveSidebarContentCellSize(rect?.height, grid.rows);

  if (!cellWidth || !cellHeight) {
    return null;
  }

  const x = Math.floor((Number(clientX) - rect.left) / cellWidth) + 1;
  const y = Math.floor((Number(clientY) - rect.top) / cellHeight) + 1;

  if (!isCellInsideGrid({ x, y }, grid)) {
    return null;
  }

  return { x, y };
}

function resolveSidebarContentGridElement(event) {
  return event?.currentTarget?.closest?.(".grid-operation-sidebar-content") ?? null;
}

export const SIDEBAR_CONTENT_POINTER_TYPES = {
  MOVE: "move",
  RESIZE: "resize"
};

export function moveSidebarContentArea(item, { dx, dy }, grid) {
  const maxX = Math.max(1, grid.columns - item.w + 1);
  const maxY = Math.max(1, grid.rows - item.h + 1);

  return {
    x: clampGridNumber(item.x + dx, 1, maxX),
    y: clampGridNumber(item.y + dy, 1, maxY),
    w: item.w,
    h: item.h
  };
}

export function resizeSidebarContentArea(item, handle, currentCell, grid) {
  const area = {
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  };
  const right = item.x + item.w - 1;
  const bottom = item.y + item.h - 1;
  const resizeHandle = String(handle ?? "");

  if (resizeHandle.includes("w")) {
    area.x = clampGridNumber(Math.min(currentCell.x, right), 1, right);
    area.w = right - area.x + 1;
  }

  if (resizeHandle.includes("e")) {
    const nextRight = clampGridNumber(Math.max(currentCell.x, item.x), item.x, grid.columns);
    area.w = nextRight - item.x + 1;
  }

  if (resizeHandle.includes("n")) {
    area.y = clampGridNumber(Math.min(currentCell.y, bottom), 1, bottom);
    area.h = bottom - area.y + 1;
  }

  if (resizeHandle.includes("s")) {
    const nextBottom = clampGridNumber(Math.max(currentCell.y, item.y), item.y, grid.rows);
    area.h = nextBottom - item.y + 1;
  }

  return area;
}

function resolveSidebarContentPointerType(value) {
  if (value === SIDEBAR_CONTENT_POINTER_TYPES.RESIZE) {
    return SIDEBAR_CONTENT_POINTER_TYPES.RESIZE;
  }

  return SIDEBAR_CONTENT_POINTER_TYPES.MOVE;
}

function resolveSidebarContentCellSize(size, trackCount) {
  const resolvedSize = Number(size);
  const resolvedTrackCount = Number(trackCount);

  if (resolvedSize <= 0 || resolvedTrackCount <= 0) {
    return null;
  }

  const cellSize = resolvedSize / resolvedTrackCount;

  return Number.isFinite(cellSize) && cellSize > 0 ? cellSize : null;
}

function normalizeGrid(value = {}) {
  return {
    columns: normalizeGridSize(value.columns),
    rows: normalizeGridSize(value.rows)
  };
}

function normalizeGridSize(value) {
  const number = Math.round(Number(value));

  return Number.isFinite(number) ? Math.max(1, number) : 1;
}

function clampGridNumber(value, min, max) {
  const number = Math.round(Number(value));
  const safeNumber = Number.isFinite(number) ? number : min;

  return Math.min(Math.max(safeNumber, min), max);
}

function isCellInsideGrid(cell, grid) {
  return (
    cell.x >= 1 &&
    cell.y >= 1 &&
    cell.x <= grid.columns &&
    cell.y <= grid.rows
  );
}
