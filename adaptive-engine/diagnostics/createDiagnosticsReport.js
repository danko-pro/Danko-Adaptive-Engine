// Diagnostics report creator
// Превращает engine snapshot в единый диагностический отчет.
// Snapshot хранит факты, diagnostics объясняет их статусом и issues.

import { createDiagnosticIssue } from "./createDiagnosticIssue.js";
import { DIAGNOSTIC_CODES } from "./diagnosticCodes.js";
import {
  resolveDiagnosticMessage,
  resolveDiagnosticSeverity
} from "./diagnosticMessages.js";
import { DIAGNOSTIC_STATUS } from "./diagnosticStatus.js";

export function createDiagnosticsReport(snapshot, engineResult = null) {
  const issues = [
    ...createWarningIssues(snapshot?.warnings),
    ...createLayoutIssues(snapshot?.layout),
    ...createOperationIssues(engineResult)
  ];
  const summary = createSummary(issues);

  return {
    engineVersion: snapshot?.engineVersion ?? null,
    timestamp: new Date().toISOString(),
    status: resolveStatus(summary),
    summary,
    issues,
    engineResult,
    snapshot
  };
}

function createWarningIssues(warnings = []) {
  return warnings.map((warning) =>
    createDiagnosticIssue({
      code: warning,
      severity: resolveDiagnosticSeverity(warning),
      source: "engine-snapshot",
      message: resolveDiagnosticMessage(warning)
    })
  );
}

function createLayoutIssues(layout) {
  if (!layout || layout.valid !== false) {
    return [];
  }

  return [
    createDiagnosticIssue({
      code: DIAGNOSTIC_CODES.LAYOUT_INVALID,
      severity: resolveDiagnosticSeverity(DIAGNOSTIC_CODES.LAYOUT_INVALID),
      source: "layout",
      message: resolveDiagnosticMessage(DIAGNOSTIC_CODES.LAYOUT_INVALID),
      details: {
        total: layout.total,
        resolved: layout.resolved,
        errors: layout.errors,
        errorsByType: layout.errorsByType
      }
    })
  ];
}

function createOperationIssues(engineResult) {
  if (!engineResult) {
    return [];
  }

  if (engineResult.rejected) {
    return [
      createDiagnosticIssue({
        code: DIAGNOSTIC_CODES.OPERATION_REJECTED,
        severity: resolveDiagnosticSeverity(DIAGNOSTIC_CODES.OPERATION_REJECTED),
        source: "operations",
        message: engineResult.rejection?.message ?? resolveDiagnosticMessage(DIAGNOSTIC_CODES.OPERATION_REJECTED),
        details: createOperationDetails(engineResult)
      })
    ];
  }

  if (engineResult.valid === false) {
    return [
      createDiagnosticIssue({
        code: DIAGNOSTIC_CODES.OPERATION_INVALID,
        severity: resolveDiagnosticSeverity(DIAGNOSTIC_CODES.OPERATION_INVALID),
        source: "operations",
        message: resolveDiagnosticMessage(DIAGNOSTIC_CODES.OPERATION_INVALID),
        details: createOperationDetails(engineResult)
      })
    ];
  }

  return [];
}

function createOperationDetails(engineResult) {
  return {
    action: engineResult.action ?? engineResult.operation?.type ?? null,
    targetId: engineResult.rejection?.targetId ?? engineResult.operation?.targetId ?? null,
    rejectionCode: engineResult.rejection?.code ?? null,
    canSuggest: Boolean(engineResult.rejection?.canSuggest),
    canAutoFix: Boolean(engineResult.rejection?.canAutoFix),
    errors: engineResult.errors ?? [],
    errorsByType: engineResult.report?.errorsByType ?? {}
  };
}

function createSummary(issues) {
  return issues.reduce(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] += 1;

      return summary;
    },
    {
      total: 0,
      info: 0,
      warning: 0,
      error: 0
    }
  );
}

function resolveStatus(summary) {
  if (summary.error > 0) {
    return DIAGNOSTIC_STATUS.ERROR;
  }

  if (summary.warning > 0) {
    return DIAGNOSTIC_STATUS.WARNING;
  }

  return DIAGNOSTIC_STATUS.OK;
}
