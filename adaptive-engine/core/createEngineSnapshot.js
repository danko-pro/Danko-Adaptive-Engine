// Engine snapshot
// Создает компактный диагностический снимок текущего состояния adaptive-engine.

import { ENGINE_VERSION } from "../config/engineVersion.js";

export function createEngineSnapshot(metrics, layoutProcessResult = null) {
  const mode = {
    current: metrics?.debug?.mode ?? null,
    horizontal: metrics?.debug?.horizontalMode ?? null,
    vertical: metrics?.debug?.verticalMode ?? null
  };

  return {
    engineVersion: metrics?.engineVersion ?? ENGINE_VERSION,
    timestamp: new Date().toISOString(),
    mode,
    rules: metrics?.debug?.rules ?? null,
    metrics: {
      columns: metrics?.columns ?? null,
      rows: metrics?.rows ?? null,
      cellSize: metrics?.cellSize ?? null,
      gridWidth: metrics?.gridWidth ?? null,
      gridHeight: metrics?.gridHeight ?? null,
      mode: mode.current,
      horizontalMode: mode.horizontal,
      verticalMode: mode.vertical
    },
    layout: {
      valid: layoutProcessResult?.valid ?? null,
      total: layoutProcessResult?.report?.summary?.total ?? null,
      resolved: layoutProcessResult?.report?.summary?.resolved ?? null,
      errors: layoutProcessResult?.report?.summary?.errors ?? null,
      errorsByType: layoutProcessResult?.report?.errorsByType ?? {}
    },
    warnings: collectSnapshotWarnings(metrics, layoutProcessResult),
    debug: {
      rulesMeta: metrics?.debug?.rulesMeta ?? null
    }
  };
}

function collectSnapshotWarnings(metrics, layoutProcessResult) {
  const warnings = [...(metrics?.debug?.rulesMeta?.warnings ?? [])];

  if (!metrics) {
    warnings.push("METRICS_MISSING");
  }

  if (layoutProcessResult && layoutProcessResult.valid === false) {
    warnings.push("LAYOUT_HAS_ERRORS");
  }

  return warnings;
}
