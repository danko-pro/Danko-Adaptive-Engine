// Engine snapshot tests
// Проверяет компактный диагностический снимок состояния движка.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { ENGINE_VERSION } from "../config/engineVersion.js";
import { GRID_RULE_WARNINGS } from "../config/gridRuleWarnings.js";
import { createEngineSnapshot } from "../core/createEngineSnapshot.js";
import { processLayoutItems } from "../layout/processLayoutItems.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);
const layoutProcessResult = processLayoutItems([{ id: "a", x: 1, y: 1, w: 2, h: 2 }], metrics);
const snapshot = createEngineSnapshot(metrics, layoutProcessResult);

assert.equal(snapshot.engineVersion, ENGINE_VERSION);
assert.equal(typeof snapshot.timestamp, "string");
assert.deepEqual(snapshot.mode, {
  current: metrics.debug.mode,
  horizontal: metrics.debug.horizontalMode,
  vertical: metrics.debug.verticalMode
});
assert.deepEqual(snapshot.rules, metrics.debug.rules);
assert.equal(snapshot.metrics.columns, metrics.columns);
assert.equal(snapshot.metrics.rows, metrics.rows);
assert.equal(snapshot.metrics.cellSize, metrics.cellSize);
assert.equal(snapshot.metrics.mode, metrics.debug.mode);
assert.deepEqual(snapshot.layout, {
  valid: true,
  total: 1,
  resolved: 1,
  errors: 0,
  errorsByType: {}
});
assert.deepEqual(snapshot.warnings, [GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION]);
assert.deepEqual(snapshot.debug.rulesMeta, metrics.debug.rulesMeta);

const emptySnapshot = createEngineSnapshot(null, null);

assert.equal(emptySnapshot.engineVersion, ENGINE_VERSION);
assert.deepEqual(emptySnapshot.mode, {
  current: null,
  horizontal: null,
  vertical: null
});
assert.equal(emptySnapshot.rules, null);
assert.equal(emptySnapshot.metrics.columns, null);
assert.equal(emptySnapshot.layout.valid, null);
assert.deepEqual(emptySnapshot.warnings, ["METRICS_MISSING"]);

console.log("engine snapshot tests passed");
