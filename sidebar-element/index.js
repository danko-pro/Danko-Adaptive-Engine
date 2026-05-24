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
  SIDEBAR_CONTENT_GEOMETRY_TARGETS,
  resolveSidebarContentGeometryTarget
} from "./contracts/sidebarContentGeometryTarget.js";
export {
  clampIconStripBarAreaToMetrics,
  mergeIconStripItemGeometry,
  normalizeIconStripBarArea,
  normalizeIconStripItemsById,
  normalizeIconStripLayout
} from "./contracts/iconStripLayout.js";
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
  OPERATION_RENDER_LAYER_IDS,
  resolveOperationRenderLayers
} from "./layer/resolveOperationRenderLayers.js";
export {
  SIDEBAR_RENDER_AREA_MODES,
  resolveSidebarRenderModel
} from "./render/resolveSidebarRenderModel.js";
export {
  SIDEBAR_MOBILE_PRESENTATION_MODES,
  resolveSidebarMobilePresentation
} from "./render/resolveSidebarMobilePresentation.js";
export {
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES,
  isMobileCompactSidebarShell,
  resolveMobileSidebarContentRenderMode,
  resolveMobileSidebarShellClassName
} from "./render/resolveMobileSidebarContentRenderMode.js";
export {
  resolveMobileIconStripContent,
  resolveMobileIconStripViewportGrid
} from "./render/resolveMobileIconStripContent.js";
export { resolveMobileIconStripItemPresentation } from "./render/resolveMobileIconStripItemPresentation.js";
export { resolveMobileIconStripItemAreaStyle } from "./render/resolveMobileIconStripItemAreaStyle.js";
export { resolveMobileIconStripSettingsChrome } from "./render/resolveMobileIconStripSettingsChrome.js";
export {
  SIDEBAR_MOBILE_RENDER_STRATEGY_TOGGLE_TITLES,
  resolveSidebarMobileRenderStrategyToggle
} from "./render/resolveSidebarMobileRenderStrategyToggle.js";
export {
  SIDEBAR_CONTENT_BUTTON_VARIANTS,
  resolveSidebarContentButtonState,
  resolveSidebarContentItemAriaDisabled,
  resolveSidebarContentItemTabIndex,
  shouldAllowSidebarContentItemActivation,
  shouldAllowSidebarContentItemMenuOpen,
  shouldAllowSidebarContentItemPointerAction
} from "./render/resolveSidebarContentButtonState.js";
export { getSidebarContentItemClassName } from "./render/resolveSidebarContentItemClassName.js";
export {
  MOBILE_SIDEBAR_MENU_BUTTON_LABELS,
  resolveMobileSidebarMenuButtonState
} from "./render/resolveMobileSidebarMenuButtonState.js";
export {
  MOBILE_SIDEBAR_MENU_PANEL_MODES,
  resolveMobileSidebarMenuItemState,
  resolveMobileSidebarMenuPanelState
} from "./render/resolveMobileSidebarMenuPanelState.js";
export {
  closeAllMobileSidebarMenus,
  closeMobileSidebarMenu,
  createMobileSidebarRuntimeState,
  isMobileSidebarMenuOpen,
  resolveMobileSidebarRuntimeKey,
  setMobileSidebarMenuOpen,
  toggleMobileSidebarMenuOpen
} from "./runtime/mobileSidebarRuntimeState.js";
export {
  MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS,
  resolveMobileSidebarButtonClickAction,
  resolveMobileSidebarButtonDoubleClickAction,
  resolveMobileSidebarButtonPointerMoveState
} from "./runtime/mobileSidebarButtonActivationState.js";
export {
  canStartMobileSidebarButtonMove,
  shouldEnterMobileSidebarButtonEditModeFromDoubleClick,
  shouldToggleMobileSidebarMenuFromClick
} from "./runtime/mobileSidebarButtonEditModeState.js";
export { resolveSidebarReservedArea } from "./reserved/resolveSidebarReservedArea.js";
export { resolveOperationSidebarReservedBoundary } from "./reserved/resolveOperationSidebarReservedBoundary.js";
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
export {
  SIDEBAR_CONTENT_GRID_SELECTOR,
  SIDEBAR_CONTENT_POINTER_TYPES,
  createSidebarContentItemPointerInteraction,
  createSidebarContentItemPointerMove,
  moveSidebarContentArea,
  resizeSidebarContentArea,
  resolveSidebarContentEventCell,
  resolveSidebarContentPointerCell
} from "./interaction/sidebarContentItemPointerOperation.js";
export {
  resolveSidebarMobileButtonAbsoluteArea,
  resolveSidebarMobileButtonRelativeArea
} from "./geometry/resolveSidebarMobileButtonRelativeArea.js";
export { resolveSidebarIconStripBarAreaPatch } from "./geometry/resolveSidebarIconStripBarAreaPatch.js";
export { createSidebarElementFromAreaCommand } from "./commands/createSidebarElementFromAreaCommand.js";
export { applySidebarStateCommand } from "./commands/applySidebarStateCommand.js";
export { applySidebarSettingsCommand } from "./commands/applySidebarSettingsCommand.js";
export { applySidebarContentItemCommand } from "./commands/applySidebarContentItemCommand.js";
export { createSidebarElementFacade } from "./facade/createSidebarElementFacade.js";
