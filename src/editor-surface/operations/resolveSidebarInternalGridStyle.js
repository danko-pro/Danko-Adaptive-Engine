export const SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS = "var(--sidebar-internal-cell-size, var(--cell-size))";

export function resolveSidebarInternalGridContent(content = {}, area = {}, sourceContent = null) {
  const grid = resolveSidebarInternalGrid(content?.grid, area, sourceContent?.grid);

  return {
    ...content,
    grid,
    items: resolveSidebarInternalGridItems(content?.items, sourceContent?.items, grid)
  };
}

export function resolveSidebarInternalGrid(grid = {}, area = {}, sourceGrid = {}) {
  return {
    columns: Math.max(
      normalizeGridSize(grid?.columns, 1),
      normalizeGridSize(area?.w, 1),
      normalizeGridSize(sourceGrid?.columns, 1)
    ),
    rows: Math.max(
      normalizeGridSize(grid?.rows, 1),
      normalizeGridSize(area?.h, 1),
      normalizeGridSize(sourceGrid?.rows, 1)
    )
  };
}

export function resolveSidebarInternalGridStyle(grid = {}) {
  const { columns, rows } = resolveSidebarInternalGrid(grid);

  return {
    width: `calc(${columns} * ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    height: `calc(${rows} * ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    gridTemplateColumns: `repeat(${columns}, ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`,
    gridTemplateRows: `repeat(${rows}, ${SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS})`
  };
}

function normalizeGridSize(value, fallback) {
  const number = Math.round(Number(value));
  const resolved = Number.isFinite(number) ? number : fallback;

  return Math.max(1, resolved);
}

function resolveSidebarInternalGridItems(items, sourceItems, grid) {
  if (!Array.isArray(items)) {
    return [];
  }

  const sourceItemsById = new Map(
    (Array.isArray(sourceItems) ? sourceItems : [])
      .filter(isRecord)
      .map((item) => [String(item.id), item])
  );

  if (sourceItemsById.size === 0) {
    return items;
  }

  return items.map((item) => {
    const sourceItem = sourceItemsById.get(String(item?.id));

    if (!sourceItem) {
      return item;
    }

    return {
      ...item,
      x: clampGridPosition(sourceItem.x, item.x, grid.columns),
      y: clampGridPosition(sourceItem.y, item.y, grid.rows),
      w: clampGridSize(sourceItem.w, item.w, grid.columns - clampGridPosition(sourceItem.x, item.x, grid.columns) + 1),
      h: clampGridSize(sourceItem.h, item.h, grid.rows - clampGridPosition(sourceItem.y, item.y, grid.rows) + 1)
    };
  });
}

function clampGridPosition(value, fallback, maxValue) {
  return Math.min(Math.max(normalizeGridNumber(value, fallback), 1), Math.max(1, maxValue));
}

function clampGridSize(value, fallback, maxValue) {
  return Math.min(normalizeGridSize(value, fallback), Math.max(1, maxValue));
}

function normalizeGridNumber(value, fallback) {
  const number = Math.round(Number(value));

  return Number.isFinite(number) ? number : fallback;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
