// Grid metrics calculator
// Получает снимок рабочей области из observer-слоя и правила сетки.
// Возвращает готовые числовые и CSS-метрики, которые UI-слой применяет к CSS grid.

import { ENGINE_VERSION } from "../../config/engineVersion.js";
import { resolveGridRules } from "../../config/resolveGridRules.js";
import { resolveGridMode } from "../../modes/index.js";
import { resolveGridTracks } from "./resolveGridTracks.js";

/**
 * @param {Partial<import("../../contracts/gridTypes.js").WorkspaceSnapshot>} workspaceSnapshot
 * @param {Partial<import("../../contracts/gridTypes.js").GridRules>} rules
 * @returns {import("../../contracts/gridTypes.js").GridMetrics}
 */
// Основная функция пересчета сетки.
// Сначала считает размер ячейки, потом по нему считает количество колонок/строк.
// Это держит правую и нижнюю границу в одной геометрии с CSS-сеткой.
export function calculateGridMetrics(workspaceSnapshot, rules) {
  const resolvedRules = resolveGridRules(workspaceSnapshot, rules);
  const safeRules = resolvedRules.rules;
  const {
    minColumns,
    minVisibleColumns,
    maxColumns,
    minRows,
    minVisibleRows,
    maxRows,
    fitPadding,
    minCellSize,
    maxCellSize
  } = safeRules;

  // Размеры workspace приходят из браузера. Если данных еще нет, используем нули.
  const workspaceWidth = toSafeSize(workspaceSnapshot?.width);
  const workspaceHeight = toSafeSize(workspaceSnapshot?.height);
  const viewportWidth = toSafeSize(workspaceSnapshot?.viewportWidth, workspaceWidth);
  const viewportHeight = toSafeSize(workspaceSnapshot?.viewportHeight, workspaceHeight);
  const devicePixelRatio = toSafeSize(workspaceSnapshot?.devicePixelRatio, 1);

  // Для fit-расчета используем не весь workspace, а немного уменьшенную область.
  // Это защищает от пограничной ситуации с контурами, дробными пикселями и округлением.
  const fittingWidth = Math.max(workspaceWidth - fitPadding, 0);
  const fittingHeight = Math.max(workspaceHeight - fitPadding, 0);

  // Базовый размер ячейки считаем от минимального количества строк.
  // Ячейка остается в пределах min/max, а количество треков адаптируется отдельно.
  const baseCellHeight = minRows > 0 ? fittingHeight / minRows : 0;
  const cellSize = roundToHalfPixel(clamp(baseCellHeight, minCellSize, maxCellSize));

  // Количество колонок и строк считаем уже после cellSize.
  // CSS и расчеты используют одну и ту же ячейку, поэтому геометрия не расходится.
  const resolvedTracks = resolveGridTracks(
    { width: fittingWidth, height: fittingHeight },
    {
      minColumns,
      minVisibleColumns,
      maxColumns,
      minRows,
      minVisibleRows,
      maxRows,
      cellSize
    }
  );
  const columns = resolvedTracks.columns;
  const rows = resolvedTracks.rows;

  const availableWidth = workspaceWidth;
  const availableHeight = workspaceHeight;
  const gridWidth = roundToPixel(columns * cellSize);
  const gridHeight = roundToPixel(rows * cellSize);
  const gridMode = resolveGridMode({
    columns,
    rows,
    minColumns,
    minVisibleColumns,
    maxColumns,
    minRows,
    minVisibleRows,
    maxRows,
    cellSize,
    minCellSize,
    maxCellSize
  });

  return {
    engineVersion: ENGINE_VERSION,
    workspaceWidth,
    workspaceHeight,
    viewportWidth,
    viewportHeight,
    devicePixelRatio,
    minColumns,
    minVisibleColumns,
    maxColumns,
    minRows,
    minVisibleRows,
    maxRows,
    columns,
    rows,
    fitPadding,
    minCellSize,
    maxCellSize,
    fittingWidth,
    fittingHeight,
    availableWidth,
    availableHeight,
    cellSize,
    gridWidth,
    gridHeight,
    debug: {
      engineVersion: ENGINE_VERSION,
      mode: gridMode.mode,
      horizontalMode: gridMode.horizontalMode,
      verticalMode: gridMode.verticalMode,
      rules: safeRules,
      rulesMeta: resolvedRules.meta,
      fittingWidth,
      fittingHeight
    },
    cssVariables: {
      "--columns": columns,
      "--rows": rows,
      "--cell-size": `${cellSize}px`,
      "--grid-gap": "0px",
      "--grid-width": `${gridWidth}px`,
      "--grid-height": `${gridHeight}px`
    }
  };
}

function toSafeSize(value, fallback = 0) {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? Math.max(number, 0) : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundToPixel(value) {
  return Math.round(value * 100) / 100;
}

function roundToHalfPixel(value) {
  return Math.round(value * 2) / 2;
}
