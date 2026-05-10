// Adaptive grid facade
// Объединяет observer и calculator в один публичный слой для UI.

import { calculateGridMetrics } from "../calculators/grid/calculateGridMetrics.js";
import { observeWorkspace } from "../observers/observeWorkspace.js";

// Возвращает стартовые метрики до первого реального измерения браузера.
export function getInitialAdaptiveGridMetrics(rules) {
  return safelyCalculateGridMetrics(null, rules);
}

// Запускает наблюдение за workspace и отдает наружу уже готовые grid metrics.
// UI не должен знать, какие внутренние observer/calculator слои участвуют в расчете.
export function createAdaptiveGrid(target, rules, onChange) {
  if (typeof onChange !== "function") {
    throw new Error("createAdaptiveGrid: onChange callback is required.");
  }

  try {
    return observeWorkspace(target, (workspaceSnapshot) => {
      onChange(safelyCalculateGridMetrics(workspaceSnapshot, rules));
    });
  } catch (error) {
    console.error("createAdaptiveGrid: observer failed", error);
    onChange(safelyCalculateGridMetrics(null, rules));

    return () => {};
  }
}

function safelyCalculateGridMetrics(workspaceSnapshot, rules) {
  try {
    return calculateGridMetrics(workspaceSnapshot, rules);
  } catch (error) {
    console.error("createAdaptiveGrid: calculation failed", error);
    return calculateGridMetrics(null, rules);
  }
}
