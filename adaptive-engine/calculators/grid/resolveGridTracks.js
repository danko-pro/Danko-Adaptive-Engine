// Grid tracks resolver
// Отвечает только за количество колонок и строк.
// Получает уже рассчитанный размер ячейки и подбирает треки под рабочую область.

// Возвращает актуальное количество колонок и строк для текущей рабочей области.
// Размер ячейки, итоговую ширину/высоту и CSS variables считает другой слой.
export function resolveGridTracks(workspaceSize, rules) {
  const minColumns = rules.minColumns;
  const minVisibleColumns = rules.minVisibleColumns;
  const maxColumns = rules.maxColumns;
  const minRows = rules.minRows;
  const minVisibleRows = rules.minVisibleRows;
  const maxRows = rules.maxRows;
  const cellSize = rules.cellSize;

  return {
    columns: resolveTracksForSize(workspaceSize.width, minColumns, minVisibleColumns, maxColumns, cellSize),
    rows: resolveTracksForSize(workspaceSize.height, minRows, minVisibleRows, maxRows, cellSize)
  };
}

// Подбирает количество треков под один размер: ширину или высоту.
// Формула использует тот же cellSize, который потом применяется в CSS.
function resolveTracksForSize(availableSize, baseMinTracks, absoluteMinTracks, maxTracks, cellSize) {
  const fittingTracks = Math.max(Math.floor(availableSize / cellSize), 1);
  const minTracks = fittingTracks < baseMinTracks ? absoluteMinTracks : baseMinTracks;

  return clamp(fittingTracks, minTracks, maxTracks);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
