// Grid rules validator
// Нормализует правила сетки перед расчетами, чтобы calculator не работал с NaN,
// отрицательными размерами или перепутанными min/max границами.

import { defaultGridRules } from "../config/defaultGridRules.js";

/**
 * @param {Partial<import("../contracts/gridTypes.js").GridRules>} rules
 * @returns {import("../contracts/gridTypes.js").GridRules}
 */
export function validateGridRules(rules = {}) {
  const minColumns = toInteger(rules.minColumns, defaultGridRules.minColumns, 1);
  const minVisibleColumns = toInteger(
    rules.minVisibleColumns,
    defaultGridRules.minVisibleColumns,
    1
  );
  const maxColumns = toInteger(rules.maxColumns, defaultGridRules.maxColumns, minColumns);

  const minRows = toInteger(rules.minRows, defaultGridRules.minRows, 1);
  const minVisibleRows = toInteger(rules.minVisibleRows, defaultGridRules.minVisibleRows, 1);
  const maxRows = toInteger(rules.maxRows, defaultGridRules.maxRows, minRows);

  const minCellSize = toNumber(rules.minCellSize, defaultGridRules.minCellSize, 1);
  const maxCellSize = toNumber(rules.maxCellSize, defaultGridRules.maxCellSize, minCellSize);

  return {
    minColumns,
    minVisibleColumns: clamp(minVisibleColumns, 1, minColumns),
    maxColumns: Math.max(maxColumns, minColumns),
    minRows,
    minVisibleRows: clamp(minVisibleRows, 1, minRows),
    maxRows: Math.max(maxRows, minRows),
    fitPadding: toNumber(rules.fitPadding, defaultGridRules.fitPadding, 0),
    minCellSize,
    maxCellSize: Math.max(maxCellSize, minCellSize)
  };
}

function toInteger(value, fallback, min) {
  return Math.max(Math.round(toNumber(value, fallback, min)), min);
}

function toNumber(value, fallback, min) {
  const number = Number.parseFloat(value);
  const resolved = Number.isFinite(number) ? number : fallback;

  return Math.max(resolved, min);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
