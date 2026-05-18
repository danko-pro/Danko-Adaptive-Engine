import assert from "node:assert/strict";

import {
  APP_SURFACE_MODES,
  resolveAppSurfaceMode
} from "./resolveAppSurfaceMode.js";

assert.equal(resolveAppSurfaceMode({ DEV: true }), APP_SURFACE_MODES.DEBUG);
assert.equal(
  resolveAppSurfaceMode({ DEV: false, PROD: true }),
  APP_SURFACE_MODES.PRODUCTION
);
assert.equal(resolveAppSurfaceMode(), APP_SURFACE_MODES.PRODUCTION);

console.log("app surface mode tests passed");
