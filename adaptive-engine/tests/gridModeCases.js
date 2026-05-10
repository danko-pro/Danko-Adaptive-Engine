// Grid mode tests
// Проверяет, что режимы сетки определяются отдельно от расчета геометрии.

import assert from "node:assert/strict";
import { GRID_AXIS_MODES, GRID_MODES, resolveGridMode } from "../modes/index.js";

assert.deepEqual(
  resolveGridMode({
    columns: 30,
    rows: 30,
    minColumns: 30,
    minVisibleColumns: 8,
    maxColumns: 80,
    minRows: 30,
    minVisibleRows: 18,
    maxRows: 60,
    cellSize: 22,
    minCellSize: 16,
    maxCellSize: 30
  }),
  {
    mode: GRID_MODES.NORMAL,
    horizontalMode: GRID_AXIS_MODES.NORMAL,
    verticalMode: GRID_AXIS_MODES.NORMAL
  }
);

assert.equal(
  resolveGridMode({
    columns: 12,
    rows: 30,
    minColumns: 30,
    minVisibleColumns: 8,
    maxColumns: 80,
    minRows: 30,
    minVisibleRows: 18,
    maxRows: 60,
    cellSize: 22,
    minCellSize: 16,
    maxCellSize: 30
  }).mode,
  GRID_MODES.COMPACT_WIDTH
);

assert.equal(
  resolveGridMode({
    columns: 30,
    rows: 20,
    minColumns: 30,
    minVisibleColumns: 8,
    maxColumns: 80,
    minRows: 30,
    minVisibleRows: 18,
    maxRows: 60,
    cellSize: 22,
    minCellSize: 16,
    maxCellSize: 30
  }).mode,
  GRID_MODES.COMPACT_HEIGHT
);

assert.equal(
  resolveGridMode({
    columns: 80,
    rows: 30,
    minColumns: 30,
    minVisibleColumns: 8,
    maxColumns: 80,
    minRows: 30,
    minVisibleRows: 18,
    maxRows: 60,
    cellSize: 22,
    minCellSize: 16,
    maxCellSize: 30
  }).mode,
  GRID_MODES.MAXIMUM
);

console.log("grid mode tests passed");
