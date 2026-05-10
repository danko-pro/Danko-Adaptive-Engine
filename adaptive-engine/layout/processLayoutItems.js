// Layout items pipeline
// Официальный вход в layout-слой: normalize, validate, resolve, report.

import { createLayoutError } from "./createLayoutError.js";
import { createLayoutReport } from "./createLayoutReport.js";
import { LAYOUT_ERRORS } from "./layoutErrorCodes.js";
import { resolveLayoutItems } from "./resolveLayoutItems.js";
import { validateGridMetrics } from "../validators/validateGridMetrics.js";

export function processLayoutItems(items, metrics) {
  const sourceItems = Array.isArray(items) ? items : [];
  const metricsValidation = validateGridMetrics(metrics);

  if (!metricsValidation.valid) {
    const errors = [
      createLayoutError(LAYOUT_ERRORS.INVALID_METRICS, {
        details: {
          reason: metricsValidation.reason
        }
      })
    ];
    const invalidLayout = {
      valid: false,
      items: [],
      errors
    };

    return {
      ...invalidLayout,
      report: createLayoutReport(invalidLayout, sourceItems),
      meta: {
        received: sourceItems.length,
        resolved: 0,
        errors: errors.length
      }
    };
  }

  try {
    const resolvedLayout = resolveLayoutItems(sourceItems, metrics);
    const report = createLayoutReport(resolvedLayout, sourceItems);

    return {
      valid: resolvedLayout.valid,
      items: resolvedLayout.items,
      errors: resolvedLayout.errors,
      report,
      meta: {
        received: sourceItems.length,
        resolved: resolvedLayout.items.length,
        errors: resolvedLayout.errors.length
      }
    };
  } catch (error) {
    const errors = [
      createLayoutError(LAYOUT_ERRORS.PROCESS_FAILED, {
        details: {
          message: error instanceof Error ? error.message : "Unknown layout process error"
        }
      })
    ];
    const failedLayout = {
      valid: false,
      items: [],
      errors
    };

    return {
      ...failedLayout,
      report: createLayoutReport(failedLayout, sourceItems),
      meta: {
        received: sourceItems.length,
        resolved: 0,
        errors: errors.length
      }
    };
  }
}
