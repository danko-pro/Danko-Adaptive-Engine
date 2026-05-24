export const MOBILE_ICON_STRIP_CELL_SIZE_CSS = "var(--cell-size)";

export function resolveMobileIconStripGridStyle(grid = {}) {
  const columns = Math.max(1, Math.round(Number(grid.columns)) || 1);
  const rows = Math.max(1, Math.round(Number(grid.rows)) || 1);

  return {
    width: `calc(${columns} * ${MOBILE_ICON_STRIP_CELL_SIZE_CSS})`,
    height: `calc(${rows} * ${MOBILE_ICON_STRIP_CELL_SIZE_CSS})`,
    gridTemplateColumns: `repeat(${columns}, ${MOBILE_ICON_STRIP_CELL_SIZE_CSS})`,
    gridTemplateRows: `repeat(${rows}, ${MOBILE_ICON_STRIP_CELL_SIZE_CSS})`
  };
}
