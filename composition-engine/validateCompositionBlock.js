import { COMPOSITION_ISSUE_CODES } from "./contracts/compositionIssueCodes.js";
import { COMPOSITION_ISSUE_SEVERITY } from "./contracts/compositionIssueSeverity.js";
import { createCompositionIssue } from "./createCompositionIssue.js";

export function validateCompositionBlock(block, metrics) {
  const issues = [];

  if (!block || typeof block !== "object") {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.INVALID_BLOCK,
        message: "Блок должен быть объектом.",
        severity: COMPOSITION_ISSUE_SEVERITY.ERROR
      })
    );

    return { valid: false, issues };
  }

  if (!block.id) {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.INVALID_BLOCK,
        message: "У блока должен быть стабильный id.",
        severity: COMPOSITION_ISSUE_SEVERITY.ERROR
      })
    );
  }

  const areaValid = ["x", "y", "w", "h"].every((field) => Number.isFinite(Number(block[field])));

  if (!areaValid || Number(block.w) < 1 || Number(block.h) < 1) {
    issues.push(
      createCompositionIssue({
        code: COMPOSITION_ISSUE_CODES.INVALID_AREA,
        message: "У блока должна быть валидная область x/y/w/h.",
        severity: COMPOSITION_ISSUE_SEVERITY.ERROR,
        blockId: block.id ?? null
      })
    );
  }

  if (areaValid && isMetricsValid(metrics)) {
    const right = Number(block.x) + Number(block.w) - 1;
    const bottom = Number(block.y) + Number(block.h) - 1;

    if (Number(block.x) < 1 || Number(block.y) < 1) {
      issues.push(
        createCompositionIssue({
          code: COMPOSITION_ISSUE_CODES.BLOCK_OUT_OF_GRID,
          message: "Блок начинается за пределами рабочей сетки.",
          severity: COMPOSITION_ISSUE_SEVERITY.ERROR,
          blockId: block.id ?? null,
          details: { right, bottom, columns: metrics.columns, rows: metrics.rows }
        })
      );
    }

    if (right > metrics.columns || bottom > metrics.rows) {
      issues.push(
        createCompositionIssue({
          code: COMPOSITION_ISSUE_CODES.BLOCK_OUT_OF_GRID,
          message: "Блок не помещается в текущую сетку и требует адаптационного решения.",
          severity: COMPOSITION_ISSUE_SEVERITY.WARNING,
          blockId: block.id ?? null,
          details: { right, bottom, columns: metrics.columns, rows: metrics.rows }
        })
      );
    }
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
