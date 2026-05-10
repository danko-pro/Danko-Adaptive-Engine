// Public API adaptive-engine.
// Внешний код импортирует движок отсюда, не залезая напрямую во внутренние слои.

export {
  createAdaptiveGrid,
  getInitialAdaptiveGridMetrics
} from "./createAdaptiveGrid.js";
export { createEngineSnapshot } from "./createEngineSnapshot.js";
export { AREA_ERRORS, createArea, resolveArea, validateArea } from "../area/index.js";
export {
  calculateGridMetrics
} from "../calculators/grid/calculateGridMetrics.js";
export { createEngineResult } from "../contracts/index.js";
export { resolveGridTracks } from "../calculators/grid/resolveGridTracks.js";
export { observeWorkspace } from "../observers/observeWorkspace.js";
export {
  applyOperation,
  createOperation,
  createOperationError,
  createOperationReport,
  OPERATION_ERRORS,
  OPERATION_TYPES,
  validateOperation
} from "../operations/index.js";
export { canPlaceArea, findFreeArea, PLACEMENT_ERRORS } from "../placement/index.js";
export {
  REJECTION_ERRORS,
  createRejection,
  explainRejection,
  resolveRejection
} from "../rejections/index.js";
export {
  createSelectionResult,
  resolveSelection,
  SELECTION_ERRORS,
  SELECTION_TYPES,
  validateSelectionInput
} from "../selection/index.js";
export { defaultGridRules } from "../config/defaultGridRules.js";
export { ENGINE_VERSION } from "../config/engineVersion.js";
export { GRID_RULE_PROFILES, gridRuleProfiles } from "../config/gridRuleProfiles.js";
export { GRID_RULE_WARNINGS } from "../config/gridRuleWarnings.js";
export { resolveGridRules } from "../config/resolveGridRules.js";
export { resolveWorkspaceState, WORKSPACE_STATES } from "../config/resolveWorkspaceState.js";
export { selectGridRuleProfile } from "../config/selectGridRuleProfile.js";
export { WORKSPACE_STATE_LIMITS } from "../config/workspaceStateLimits.js";
export { createGridCoordinateSystem } from "../coordinates/createGridCoordinateSystem.js";
export { validateGridArea, GRID_AREA_ERRORS } from "../coordinates/validateGridArea.js";
export {
  CONSTRAINT_ERRORS,
  createConstraint,
  resolveConstraint,
  validateConstraint
} from "../constraints/index.js";
export { clampAreaToGrid, FITTING_ERRORS } from "../fitting/index.js";
export {
  INTENT_ERRORS,
  INTENT_TYPES,
  createAreaIntent,
  resolveAreaIntent,
  validateAreaIntent
} from "../intents/index.js";
export {
  DIAGNOSTIC_CODES,
  createDiagnosticIssue,
  createDiagnosticsReport,
  diagnosticMessages,
  DIAGNOSTIC_SEVERITY,
  DIAGNOSTIC_STATUS,
  resolveDiagnosticMessage,
  resolveDiagnosticSeverity
} from "../diagnostics/index.js";
export { GRID_AXIS_MODES, GRID_MODES, resolveGridMode } from "../modes/index.js";
export { detectAreaCollision } from "../layout/detectAreaCollision.js";
export {
  createLayoutMap,
  detectItemRelations,
  LAYOUT_MAP_ERRORS,
  resolveResponsiveMap
} from "../layout-map/index.js";
export { createLayoutError } from "../layout/createLayoutError.js";
export { createLayoutReport } from "../layout/createLayoutReport.js";
export { LAYOUT_ERRORS } from "../layout/layoutErrorCodes.js";
export { normalizeLayoutItem } from "../layout/normalizeLayoutItem.js";
export { normalizeLayoutItems } from "../layout/normalizeLayoutItems.js";
export { prepareLayoutItems } from "../layout/prepareLayoutItems.js";
export { processLayoutItems } from "../layout/processLayoutItems.js";
export { resolveLayoutItems } from "../layout/resolveLayoutItems.js";
export { validateGridMetrics } from "../validators/validateGridMetrics.js";
export { validateLayoutItems } from "../layout/validateLayoutItems.js";
export { validateGridRules } from "../validators/validateGridRules.js";
export { assertGridMetrics } from "../validators/assertGridMetrics.js";
