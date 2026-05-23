export { SIDEBAR_DOCKS, isSidebarDock, resolveSidebarDock } from "./contracts/sidebarDock.js";
export {
  DEFAULT_SIDEBAR_CONTENT_GRID,
  DEFAULT_SIDEBAR_CONTENT_ITEM_STYLE,
  SIDEBAR_CONTENT_ACTION_TYPES,
  SIDEBAR_CONTENT_FONT_FAMILIES,
  SIDEBAR_CONTENT_ITEM_TYPES,
  SIDEBAR_CONTENT_TEXT_ALIGNS,
  SIDEBAR_TEXT_FIT_MODES,
  normalizeSidebarContent,
  normalizeSidebarContentGrid,
  normalizeSidebarContentItems,
  resolveSidebarContentRequiredGridSize,
  resolveSidebarContentItemType,
  resolveSidebarTextFitMode
} from "./contracts/sidebarContent.js";
export {
  DEFAULT_SIDEBAR_MOBILE_LAYOUT,
  DEFAULT_SIDEBAR_MOBILE_RENDER_STRATEGY,
  DEFAULT_SIDEBAR_RESPONSIVE,
  SIDEBAR_ANIMATIONS,
  SIDEBAR_CONTRACT_VERSION,
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  SIDEBAR_TRIGGERS,
  SIDEBAR_VIEWPORT_MODES,
  areSidebarElementContractsEqual,
  normalizeSidebarElementContract,
  normalizeSidebarMobileButtonArea,
  normalizeSidebarMobileLayout,
  resolveSidebarAnimation,
  resolveSidebarMobileRenderStrategy,
  resolveSidebarTrigger
} from "./contracts/sidebarElementContract.js";
export { SIDEBAR_LAYERS, isSidebarLayer } from "./contracts/sidebarLayer.js";
export { SIDEBAR_STATES, isSidebarState, resolveSidebarState } from "./contracts/sidebarState.js";
export {
  SIDEBAR_RENDER_MODES,
  SIDEBAR_STATE_POLICIES,
  resolveSidebarStatePolicy,
  sidebarStateAffectsWorkspaceBlocks,
  sidebarStateAllowsWorkspaceBlocksUnder,
  sidebarStateReservesSpace
} from "./contracts/sidebarStatePolicy.js";
export { resolveSidebarDockFromArea } from "./dock/resolveSidebarDock.js";
export { resolveSidebarLayer } from "./layer/resolveSidebarLayer.js";
export { createSidebarSceneProjection } from "./layer/createSidebarSceneProjection.js";
export {
  SIDEBAR_RENDER_AREA_MODES,
  resolveSidebarRenderModel
} from "./render/resolveSidebarRenderModel.js";
export {
  SIDEBAR_MOBILE_PRESENTATION_MODES,
  resolveSidebarMobilePresentation
} from "./render/resolveSidebarMobilePresentation.js";
export {
  closeAllMobileSidebarMenus,
  closeMobileSidebarMenu,
  createMobileSidebarRuntimeState,
  isMobileSidebarMenuOpen,
  resolveMobileSidebarRuntimeKey,
  setMobileSidebarMenuOpen,
  toggleMobileSidebarMenuOpen
} from "./runtime/mobileSidebarRuntimeState.js";
export { resolveSidebarReservedArea } from "./reserved/resolveSidebarReservedArea.js";
export {
  SIDEBAR_CONTENT_TEXT_FIT_DIAGNOSTIC_CODES,
  resolveSidebarContentTextFitDiagnostics
} from "./diagnostics/resolveSidebarContentTextFitDiagnostics.js";
export {
  SIDEBAR_CONTENT_GEOMETRY_ERROR_CODES,
  hasSidebarContentItemGeometryPatch,
  resolveSidebarContentItemGeometryStatus
} from "./geometry/resolveSidebarContentItemGeometry.js";
export { resolveSidebarViewportModeFromMetrics } from "./adapters/resolveSidebarViewportModeFromMetrics.js";
export {
  resolveSidebarLayoutOccupancy,
  shouldPreserveSidebarSourceGeometry
} from "./interaction/resolveSidebarLayoutOccupancy.js";
export { createSidebarElementFromAreaCommand } from "./commands/createSidebarElementFromAreaCommand.js";
export { applySidebarStateCommand } from "./commands/applySidebarStateCommand.js";
export { applySidebarSettingsCommand } from "./commands/applySidebarSettingsCommand.js";
export { applySidebarContentItemCommand } from "./commands/applySidebarContentItemCommand.js";
export { createSidebarElementFacade } from "./facade/createSidebarElementFacade.js";
