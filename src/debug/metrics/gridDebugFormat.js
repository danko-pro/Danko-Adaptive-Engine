export function formatGridDebugMetrics(metrics) {
  const rulesMeta = metrics.debug?.rulesMeta;

  return [
    ["version", "версия", metrics.engineVersion],
    ["mode", "режим", metrics.debug?.mode],
    ["profile", "профиль", rulesMeta?.profile],
    ["candidate", "кандидат", rulesMeta?.candidate],
    ["workspace state", "состояние области", rulesMeta?.workspaceState],
    ["reason", "причина", rulesMeta?.reason],
    ["selection", "выбор", rulesMeta?.selectionReason],
    ["warnings", "предупреждения", formatWarnings(rulesMeta?.warnings)],
    ["horizontal", "горизонталь", metrics.debug?.horizontalMode],
    ["vertical", "вертикаль", metrics.debug?.verticalMode],
    ["columns", "колонки", metrics.columns],
    ["rows", "строки", metrics.rows],
    ["cell", "ячейка", `${metrics.cellSize}px`],
    ["grid", "сетка", `${metrics.gridWidth}px x ${metrics.gridHeight}px`],
    ["workspace", "рабочая область", `${round(metrics.workspaceWidth)}px x ${round(metrics.workspaceHeight)}px`]
  ];
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function formatWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    return "none";
  }

  return warnings.join(", ");
}
