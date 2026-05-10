// Diagnostic messages registry
// Хранит человекочитаемые сообщения и severity для известных diagnostic codes.

import { DIAGNOSTIC_CODES } from "./diagnosticCodes.js";
import { DIAGNOSTIC_SEVERITY } from "./diagnosticSeverity.js";

export const diagnosticMessages = {
  [DIAGNOSTIC_CODES.METRICS_MISSING]: {
    severity: DIAGNOSTIC_SEVERITY.ERROR,
    message: "Grid metrics are missing."
  },
  [DIAGNOSTIC_CODES.LAYOUT_HAS_ERRORS]: {
    severity: DIAGNOSTIC_SEVERITY.ERROR,
    message: "Layout process has errors."
  },
  [DIAGNOSTIC_CODES.LAYOUT_INVALID]: {
    severity: DIAGNOSTIC_SEVERITY.ERROR,
    message: "Layout pipeline returned errors."
  },
  [DIAGNOSTIC_CODES.OPERATION_REJECTED]: {
    severity: DIAGNOSTIC_SEVERITY.WARNING,
    message: "Operation was rejected by the engine."
  },
  [DIAGNOSTIC_CODES.OPERATION_INVALID]: {
    severity: DIAGNOSTIC_SEVERITY.ERROR,
    message: "Operation result is invalid."
  }
};

export function resolveDiagnosticMessage(code) {
  return diagnosticMessages[code]?.message ?? `Engine warning: ${code}.`;
}

export function resolveDiagnosticSeverity(code) {
  return diagnosticMessages[code]?.severity ?? DIAGNOSTIC_SEVERITY.WARNING;
}
