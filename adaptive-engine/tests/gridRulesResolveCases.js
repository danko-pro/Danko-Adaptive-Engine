// Grid rules resolver tests
// Проверяет, что итоговые правила готовятся отдельным слоем перед metrics calculator.

import assert from "node:assert/strict";
import { defaultGridRules } from "../config/defaultGridRules.js";
import {
  GRID_RULE_PROFILES,
  GRID_RULE_PROFILE_STATUSES
} from "../config/gridRuleProfiles.js";
import { GRID_RULE_WARNINGS } from "../config/gridRuleWarnings.js";
import { resolveGridRules } from "../config/resolveGridRules.js";
import { selectGridRuleProfile } from "../config/selectGridRuleProfile.js";

const measured = resolveGridRules({ width: 900, height: 700 }, defaultGridRules);

assert.deepEqual(measured.rules, defaultGridRules);
assert.equal(measured.meta.source, "grid-rule-profile");
assert.equal(measured.meta.profile, GRID_RULE_PROFILES.BASE);
assert.equal(measured.meta.profileStatus, GRID_RULE_PROFILE_STATUSES.CALIBRATED);
assert.equal(measured.meta.profileEnabled, true);
assert.equal(measured.meta.candidate, GRID_RULE_PROFILES.BASE);
assert.equal(measured.meta.candidateEnabled, false);
assert.equal(measured.meta.reason, "workspace-measured");
assert.equal(measured.meta.selectionReason, "calibrating-base-profile");
assert.equal(measured.meta.workspaceState, "measured");
assert.deepEqual(measured.meta.warnings, [GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION]);

const narrow = resolveGridRules({ width: 390, height: 720 }, defaultGridRules);
assert.equal(narrow.meta.workspaceState, "narrow");
assert.equal(narrow.meta.profile, GRID_RULE_PROFILES.BASE);
assert.equal(narrow.meta.candidate, GRID_RULE_PROFILES.NARROW);
assert.equal(narrow.meta.candidateEnabled, false);
assert.equal(narrow.meta.selectionReason, "candidate-disabled");
assert.deepEqual(narrow.meta.warnings, [
  GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION,
  GRID_RULE_WARNINGS.WORKSPACE_NARROW
]);

const short = resolveGridRules({ width: 900, height: 360 }, defaultGridRules);
assert.equal(short.meta.workspaceState, "short");
assert.equal(short.meta.candidate, GRID_RULE_PROFILES.SHORT);
assert.equal(short.meta.selectionReason, "candidate-disabled");
assert.deepEqual(short.meta.warnings, [
  GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION,
  GRID_RULE_WARNINGS.WORKSPACE_SHORT
]);

const tiny = resolveGridRules({ width: 320, height: 360 }, defaultGridRules);
assert.equal(tiny.meta.workspaceState, "tiny");
assert.equal(tiny.meta.candidate, GRID_RULE_PROFILES.TINY);
assert.equal(tiny.meta.selectionReason, "candidate-disabled");
assert.deepEqual(tiny.meta.warnings, [
  GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION,
  GRID_RULE_WARNINGS.WORKSPACE_TINY
]);

const empty = resolveGridRules({ width: 0, height: 700 }, defaultGridRules);
assert.equal(empty.meta.workspaceState, "empty");
assert.deepEqual(empty.meta.warnings, [
  GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION,
  GRID_RULE_WARNINGS.WORKSPACE_EMPTY
]);

const fallback = resolveGridRules(null, {
  minColumns: -1,
  minVisibleColumns: 999,
  maxColumns: 0,
  minRows: Number.NaN,
  minVisibleRows: -10,
  maxRows: 0,
  fitPadding: -5,
  minCellSize: 0,
  maxCellSize: -1
});

assert.equal(fallback.rules.minColumns, 1);
assert.equal(fallback.rules.minVisibleColumns, 1);
assert.equal(fallback.rules.maxColumns, 1);
assert.equal(fallback.rules.minCellSize, 1);
assert.equal(fallback.rules.maxCellSize, 1);
assert.equal(fallback.meta.reason, "initial-fallback");
assert.equal(fallback.meta.selectionReason, "fallback-base-profile");
assert.equal(fallback.meta.workspaceState, "unknown");
assert.equal(fallback.meta.candidate, GRID_RULE_PROFILES.BASE);
assert.deepEqual(fallback.meta.warnings, [
  GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION,
  GRID_RULE_WARNINGS.WORKSPACE_MISSING
]);

const selectedProfile = selectGridRuleProfile("narrow");
assert.equal(selectedProfile.profile.name, GRID_RULE_PROFILES.BASE);
assert.equal(selectedProfile.candidate, GRID_RULE_PROFILES.NARROW);
assert.equal(selectedProfile.candidateEnabled, false);
assert.equal(selectedProfile.reason, "candidate-disabled");

console.log("grid rules resolver tests passed");
