export const SIDEBAR_INTERNAL_GRID_CELL_SIZE_CSS = "var(--sidebar-internal-cell-size, var(--cell-size))";

export function resolveSidebarInternalGridContent(content = {}, area = {}) {
  return {
    ...content,
    grid: resolveSidebarInternalGrid(content?.grid, area)
  };
}

export function resolveSidebarInternalGrid(grid = {}, area = {}) {
  return {
    columns: Math.max(
      normalizeGridSize(grid?.columns, 1),
      normalizeGridSize(area?.w, 1)
    ),
    rows: Math.max(
      normalizeGridSize(grid?.rows, 1),
      normalizeGridSize(area?.h, 1)
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
