import assert from "node:assert/strict";

import { defaultDebugFlags, devDebugFlags } from "./debugFlags.js";
import { resolveDebugFlags } from "./resolveDebugFlags.js";

const profiles = {
  defaultDebugFlags,
  devDebugFlags
};

assert.deepEqual(resolveDebugFlags({ DEV: true }, profiles), devDebugFlags);
assert.deepEqual(resolveDebugFlags({ DEV: false, PROD: true }, profiles), defaultDebugFlags);

assert.equal(defaultDebugFlags.showMetricsOverlay, false);
assert.equal(defaultDebugFlags.showOperationProbe, false);
assert.equal(defaultDebugFlags.showSelectedCell, false);
assert.equal(defaultDebugFlags.showIntentCellCreator, false);

assert.deepEqual(devDebugFlags, {
  showMetricsOverlay: true,
  showRandomCell: false,
  showHoverCell: false,
  showAreaProbe: false,
  showOperationProbe: true,
  showSelectedCell: true,
  showIntentCellCreator: true,
  showTelemetryPanel: false
});

console.log("debug flags dev/prod profile tests passed");
