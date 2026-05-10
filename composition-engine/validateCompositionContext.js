import { COMPOSITION_ISSUE_CODES } from "./contracts/compositionIssueCodes.js";
import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";
import { COMPOSITION_MODES } from "./contracts/compositionModes.js";
import { createCompositionIssue } from "./createCompositionIssue.js";
import { validateCompositionBlock } from "./validateCompositionBlock.js";

export function validateCompositionContext(context) {
  const issues = [];

  if (!context || typeof context !== "object") {
    return {
      valid: false,
      issues: [
        createCompositionIssue({
          code: COMPOSITION_ISSUE_CODES.INVALID_CONTEXT,
          message: "Контекст композиции должен быть объектом.",
          severity: COMPOSITION_ISSUE_SEVERITY.ERROR
        })
      ]
    };
  }

  if (context.mode === COMPOSITION_MODES.OFF) {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.CONTEXT_DISABLED,
        message: "Композиционный слой выключен."
      })
    );
  }

  if (!isMetricsValid(context.metrics)) {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.INVALID_METRICS,
        message: "Для анализа композиции нужны валидные metrics.",
        severity: COMPOSITION_ISSUE_SEVERITY.ERROR
      })
    );
  }

  if (!Array.isArray(context.items)) {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.INVALID_CONTEXT,
        message: "Поле items должно быть массивом.",
        severity: COMPOSITION_ISSUE_SEVERITY.ERROR
      })
    );
  }

  for (const item of Array.isArray(context.items) ? context.items : []) {
    issues.push(...validateCompositionBlock(item, context.metrics).issues);
  }

  return {
    valid: !issues.some((issue) => issue.severity === COMPOSITION_ISSUE_SEVERITY.ERROR),
    issues
  };
}

function isMetricsValid(metrics) {
  return (
    metrics &&
    Number.isFinite(Number(metrics.columns)) &&
    Number.isFinite(Number(metrics.rows)) &&
    Number(metrics.columns) > 0 &&
    Number(metrics.rows) > 0
  );
}
