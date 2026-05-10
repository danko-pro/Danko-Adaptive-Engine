// Grid metrics tests
// Проверяет геометрию и защитные инварианты adaptive-engine без UI.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { ENGINE_VERSION } from "../config/engineVersion.js";
import { assertGridMetrics } from "../validators/assertGridMetrics.js";

const cases = [
  { name: "desktop-wide", width: 1830, height: 830 },
  { name: "tablet", width: 840, height: 640 },
  { name: "mobile", width: 390, height: 720 },
  { name: "tiny", width: 240, height: 320 },
  { name: "zero", width: 0, height: 0 },
  { name: "huge-monitor", width: 3200, height: 1600 },
  { name: "bad-negative", width: -200, height: -100 },
  { name: "bad-nan", width: Number.NaN, height: Number.NaN }
];

for (const item of cases) {
  const metrics = calculateGridMetrics(
    {
      width: item.width,
      height: item.height,
      viewportWidth: item.width,
      viewportHeight: item.height,
      devicePixelRatio: 1
    },
    defaultGridRules
  );

  assertGridMetrics(metrics);
  assert.equal(metrics.engineVersion, ENGINE_VERSION);
  assert.equal(metrics.debug.engineVersion, ENGINE_VERSION);
  assert.equal(metrics.cellSize * 2, Math.round(metrics.cellSize * 2));
  assert.equal(metrics.gridWidth, roundPixel(metrics.columns * metrics.cellSize));
  assert.equal(metrics.gridHeight, roundPixel(metrics.rows * metrics.cellSize));
}

const metricsWithBrokenRules = calculateGridMetrics(
  { width: 390, height: 720, viewportWidth: 390, viewportHeight: 720, devicePixelRatio: 1 },
  {
    minColumns: -10,
    minVisibleColumns: 999,
    maxColumns: 0,
    minRows: Number.NaN,
    minVisibleRows: -5,
    maxRows: 1,
    fitPadding: -20,
    minCellSize: 0,
    maxCellSize: -30
  }
);

assertGridMetrics(metricsWithBrokenRules);
assert.equal(metricsWithBrokenRules.engineVersion, ENGINE_VERSION);

console.log("grid metrics tests passed");

function roundPixel(value) {
  return Math.round(value * 100) / 100;
}
