// Workspace state tests
// Проверяет ручные пороги калибровки базового режима.

import assert from "node:assert/strict";
import {
  resolveWorkspaceState,
  WORKSPACE_STATES
} from "../config/resolveWorkspaceState.js";
import { WORKSPACE_STATE_LIMITS } from "../config/workspaceStateLimits.js";

assert.equal(resolveWorkspaceState(null), WORKSPACE_STATES.UNKNOWN);
assert.equal(resolveWorkspaceState({ width: 0, height: 700 }), WORKSPACE_STATES.EMPTY);
assert.equal(resolveWorkspaceState({ width: 700, height: 0 }), WORKSPACE_STATES.EMPTY);

assert.equal(
  resolveWorkspaceState({
    width: WORKSPACE_STATE_LIMITS.narrowWidth - 1,
    height: 720
  }),
  WORKSPACE_STATES.NARROW
);

assert.equal(
  resolveWorkspaceState({
    width: WORKSPACE_STATE_LIMITS.narrowWidth,
    height: 720
  }),
  WORKSPACE_STATES.MEASURED
);

assert.equal(
  resolveWorkspaceState({
    width: 900,
    height: WORKSPACE_STATE_LIMITS.shortHeight - 1
  }),
  WORKSPACE_STATES.SHORT
);

assert.equal(
  resolveWorkspaceState({
    width: 900,
    height: WORKSPACE_STATE_LIMITS.shortHeight
  }),
  WORKSPACE_STATES.MEASURED
);

assert.equal(
  resolveWorkspaceState({
    width: WORKSPACE_STATE_LIMITS.narrowWidth - 1,
    height: WORKSPACE_STATE_LIMITS.shortHeight - 1
  }),
  WORKSPACE_STATES.TINY
);

assert.equal(
  resolveWorkspaceState(
    { width: 599, height: 700 },
    { narrowWidth: 600, shortHeight: 500 }
  ),
  WORKSPACE_STATES.NARROW
);

console.log("workspace state tests passed");
