import { resolveDebugFlags } from "./resolveDebugFlags.js";

export const defaultDebugFlags = {
  showMetricsOverlay: false,
  showRandomCell: false,
  showHoverCell: false,
  showAreaProbe: false,
  showOperationProbe: false,
  showSelectedCell: false,
  showIntentCellCreator: false,
  showTelemetryPanel: false
};

export const devDebugFlags = {
  showMetricsOverlay: true,
  showRandomCell: false,
  showHoverCell: false,
  showAreaProbe: false,
  showOperationProbe: true,
  showSelectedCell: true,
  showIntentCellCreator: true,
  showTelemetryPanel: false
};

const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : {};

export const debugFlags = resolveDebugFlags(viteEnv, {
  defaultDebugFlags,
  devDebugFlags
});
