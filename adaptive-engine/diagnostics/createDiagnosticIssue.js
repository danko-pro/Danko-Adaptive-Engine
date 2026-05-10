// Diagnostic issue creator
// Нормализует одно диагностическое сообщение, чтобы отчеты не расходились по форме.

import { DIAGNOSTIC_SEVERITY } from "./diagnosticSeverity.js";

export function createDiagnosticIssue({ code, severity, source, message, details = null }) {
  return {
    code: String(code || "UNKNOWN_DIAGNOSTIC"),
    severity: normalizeSeverity(severity),
    source: String(source || "adaptive-engine"),
    message: String(message || code || "Unknown diagnostic issue."),
    details
  };
}

function normalizeSeverity(severity) {
  if (Object.values(DIAGNOSTIC_SEVERITY).includes(severity)) {
    return severity;
  }

  return DIAGNOSTIC_SEVERITY.INFO;
}
