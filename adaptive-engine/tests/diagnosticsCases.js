// Diagnostics tests
// Проверяет, что diagnostics assistant превращает snapshot в единый отчет.

import assert from "node:assert/strict";
import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { defaultGridRules } from "../config/defaultGridRules.js";
import { GRID_RULE_WARNINGS } from "../config/gridRuleWarnings.js";
import { createEngineSnapshot } from "../core/createEngineSnapshot.js";
import {
  createDiagnosticsReport,
  DIAGNOSTIC_CODES,
  DIAGNOSTIC_SEVERITY,
  DIAGNOSTIC_STATUS,
  resolveDiagnosticMessage,
  resolveDiagnosticSeverity
} from "../diagnostics/index.js";
import { processLayoutItems } from "../layout/processLayoutItems.js";
import { applyOperation, OPERATION_TYPES } from "../operations/index.js";
import { REJECTION_ERRORS } from "../rejections/index.js";

const metrics = calculateGridMetrics(
  { width: 900, height: 900, viewportWidth: 900, viewportHeight: 900, devicePixelRatio: 1 },
  defaultGridRules
);
const layoutProcessResult = processLayoutItems([{ id: "a", x: 1, y: 1, w: 2, h: 2 }], metrics);
const snapshot = createEngineSnapshot(metrics, layoutProcessResult);
const report = createDiagnosticsReport(snapshot);

assert.equal(report.status, DIAGNOSTIC_STATUS.WARNING);
assert.equal(report.summary.total, 1);
assert.equal(report.summary.warning, 1);
assert.equal(report.summary.error, 0);
assert.equal(report.issues[0].code, GRID_RULE_WARNINGS.BASE_PROFILE_CALIBRATION);
assert.equal(report.issues[0].severity, DIAGNOSTIC_SEVERITY.WARNING);
assert.equal(report.snapshot, snapshot);

const emptyReport = createDiagnosticsReport(createEngineSnapshot(null, null));

assert.equal(emptyReport.status, DIAGNOSTIC_STATUS.ERROR);
assert.equal(emptyReport.summary.error, 1);
assert.equal(emptyReport.issues[0].code, DIAGNOSTIC_CODES.METRICS_MISSING);
assert.equal(
  emptyReport.issues[0].message,
  resolveDiagnosticMessage(DIAGNOSTIC_CODES.METRICS_MISSING)
);

const brokenLayout = processLayoutItems(
  [
    { id: "a", x: 1, y: 1, w: 2, h: 2 },
    { id: "b", x: 1, y: 1, w: 2, h: 2 }
  ],
  metrics
);
const brokenReport = createDiagnosticsReport(createEngineSnapshot(metrics, brokenLayout));

assert.equal(brokenReport.status, DIAGNOSTIC_STATUS.ERROR);
assert.equal(brokenReport.issues.some((issue) => issue.code === DIAGNOSTIC_CODES.LAYOUT_HAS_ERRORS), true);
assert.equal(brokenReport.issues.some((issue) => issue.code === DIAGNOSTIC_CODES.LAYOUT_INVALID), true);
assert.equal(
  resolveDiagnosticSeverity("UNKNOWN_WARNING"),
  DIAGNOSTIC_SEVERITY.WARNING
);
assert.equal(
  resolveDiagnosticMessage("UNKNOWN_WARNING"),
  "Engine warning: UNKNOWN_WARNING."
);

const rejectedOperation = applyOperation(
  [
    { id: "a", x: 1, y: 1, w: 2, h: 2 },
    { id: "b", x: 4, y: 1, w: 2, h: 2 }
  ],
  { type: OPERATION_TYPES.MOVE_AREA, targetId: "a", payload: { x: 4, y: 1 } },
  metrics
);
const operationReport = createDiagnosticsReport(snapshot, rejectedOperation);
const operationIssue = operationReport.issues.find(
  (issue) => issue.code === DIAGNOSTIC_CODES.OPERATION_REJECTED
);

assert.equal(rejectedOperation.rejection.code, REJECTION_ERRORS.AREA_COLLISION);
assert.equal(operationReport.status, DIAGNOSTIC_STATUS.WARNING);
assert.equal(Boolean(operationIssue), true);
assert.equal(operationIssue.source, "operations");
assert.equal(operationIssue.details.action, OPERATION_TYPES.MOVE_AREA);
assert.equal(operationIssue.details.targetId, "a");
assert.equal(operationIssue.details.rejectionCode, REJECTION_ERRORS.AREA_COLLISION);
assert.equal(operationIssue.details.canSuggest, true);

const invalidOperationResult = {
  valid: false,
  rejected: false,
  action: "manual-invalid",
  errors: [{ type: "MANUAL_ERROR" }],
  report: {
    errorsByType: {
      MANUAL_ERROR: 1
    }
  }
};
const invalidOperationReport = createDiagnosticsReport(snapshot, invalidOperationResult);

assert.equal(
  invalidOperationReport.issues.some((issue) => issue.code === DIAGNOSTIC_CODES.OPERATION_INVALID),
  true
);

console.log("diagnostics tests passed");
