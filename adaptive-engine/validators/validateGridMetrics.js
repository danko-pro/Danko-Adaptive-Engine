// Grid metrics validator
// Проверяет, что metrics пригодны для координатных и layout-расчетов.

export function validateGridMetrics(metrics) {
  if (!metrics || typeof metrics !== "object") {
    return invalid("Metrics object is required.");
  }

  const requiredNumbers = ["columns", "rows", "cellSize", "gridWidth", "gridHeight"];

  for (const key of requiredNumbers) {
    if (!Number.isFinite(metrics[key])) {
      return invalid(`Metrics.${key} must be a finite number.`);
    }
  }

  if (metrics.columns < 1 || metrics.rows < 1 || metrics.cellSize <= 0) {
    return invalid("Metrics columns, rows and cellSize must be positive.");
  }

  if (metrics.gridWidth <= 0 || metrics.gridHeight <= 0) {
    return invalid("Metrics gridWidth and gridHeight must be positive.");
  }

  return {
    valid: true,
    reason: null
  };
}

function invalid(reason) {
  return {
    valid: false,
    reason
  };
}
