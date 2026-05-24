import { useEffect, useRef, useState } from "react";
import {
  ADAPTER_BEHAVIOR_MODES,
  resolveSelectionAfterOperation,
  SELECTION_TYPES
} from "../../../engine-adapter/index.js";
import { initialOperationProbeItems } from "./operationProbeData.js";
import { createItemsSignature } from "./operationProbeSceneData.js";
import { useOperationProbeActions } from "./useOperationProbeActions.js";
import { useOperationProbeComposition } from "./useOperationProbeComposition.js";
import { useOperationProbeKeyboard } from "./useOperationProbeKeyboard.js";
import { useOperationProbeLayoutMap } from "./useOperationProbeLayoutMap.js";
import { useOperationProbePointerInteraction } from "./useOperationProbePointerInteraction.js";
import { useSidebarContentPointerInteraction } from "./useSidebarContentPointerInteraction.js";
import { useSidebarMobileButtonPointerInteraction } from "./useSidebarMobileButtonPointerInteraction.js";
import { useSidebarIconStripBarAreaPointerInteraction } from "./useSidebarIconStripBarAreaPointerInteraction.js";
import { useSidebarCompactBarAreaPointerInteraction } from "./useSidebarCompactBarAreaPointerInteraction.js";
import {
  resolveOperationRenderLayers,
  SIDEBAR_MOBILE_PRESENTATION_MODES
} from "../../../sidebar-element/index.js";

// Состояние и действия временного пульта операций.
// UI-компоненты получают отсюда готовые props и не знают деталей применения команд.
export function useGridOperationProbe({
  items,
  setItems,
  metrics,
  selection,
  setSelection,
  behaviorMode = ADAPTER_BEHAVIOR_MODES.AUTO
}) {
  const sourceItemsRef = useRef(items);
  const sourceMetricsRef = useRef(metrics);
  const projectedItemSignaturesRef = useRef(new Set());
  const sidebarTextFitToastTimeoutRef = useRef(null);
  const [interaction, setInteraction] = useState(null);
  const [sidebarContentInteraction, setSidebarContentInteraction] = useState(null);
  const [sidebarMobileButtonInteraction, setSidebarMobileButtonInteraction] = useState(null);
  const [sidebarIconStripBarAreaInteraction, setSidebarIconStripBarAreaInteraction] = useState(null);
  const [sidebarCompactBarAreaInteraction, setSidebarCompactBarAreaInteraction] = useState(null);
  const [lastReport, setLastReport] = useState(null);
  const [sidebarTextFitToast, setSidebarTextFitToast] = useState(null);
  const {
    layoutMapStatus,
    showLayoutMapOverlay,
    captureLayoutMap,
    markProjectedItems,
    toggleLayoutMapOverlay
  } = useOperationProbeLayoutMap({ items, metrics });
  const {
    compositionPlan,
    compositionStatus,
    showCompositionOverlay,
    inspectComposition,
    applyCompositionFix,
    evaluateCompositionItems,
    applyCompositionCommand
  } = useOperationProbeComposition({
    items,
    metrics,
    behaviorMode,
    interaction,
    sidebarContentInteraction,
    sidebarMobileButtonInteraction,
    sidebarIconStripBarAreaInteraction,
    sidebarCompactBarAreaInteraction,
    sourceItemsRef,
    sourceMetricsRef,
    onProjectItems: applyProjectedItems
  });
  const {
    activeBlockType,
    closeItemMenu,
    closeTransientMenu,
    clearSelectedItem,
    copyItem,
    createLinkedBlock,
    deleteItem,
    deleteSelectedItem,
    form,
    menuMode,
    menuTarget,
    openItemMenu,
    openMobileSidebarButtonMenu,
    openSidebarContentItemMenu,
    openSelectedItemMenu,
    renameSidebarContentItem,
    renameItem,
    renameValue,
    resetRelationAdaptivePosition,
    resetProbe,
    runOperation,
    selectMobileSidebarButton,
    selectSidebarContentItem,
    selectSidebarShell,
    setRenameValue,
    setSidebarSettings,
    setSidebarState,
    startRenameSidebarContentItem,
    startRenameItem,
    updateBlockType,
    updateForm,
    updateSidebarContentItemGeometry,
    updateSidebarContentItemPatch,
    updateSidebarContentItemStyle
  } = useOperationProbeActions({
    items,
    metrics,
    selection,
    setSelection,
    sourceItemsRef,
    sourceMetricsRef,
    onOperationResult: applyOperationResult,
    onProjectItems: applyProjectedItems,
    onResetProbe: resetProbeState,
    onSidebarContentTextFitWarning: showSidebarTextFitToast,
    onSidebarStateResult: applySidebarStateResult
  });
  const {
    startMove: startBlockMove,
    startResize: startBlockResize
  } = useOperationProbePointerInteraction({
    interaction,
    setInteraction,
    items,
    metrics,
    setSelection,
    onInteractionStart: closeTransientMenu,
    onOperationResult: applyOperationResult,
    onProjectItems: applyProjectedItems
  });
  const {
    startSidebarContentMove,
    startSidebarContentResize
  } = useSidebarContentPointerInteraction({
    interaction: sidebarContentInteraction,
    setInteraction: setSidebarContentInteraction,
    items,
    metrics,
    setSelection,
    onInteractionStart: closeTransientMenu,
    onOperationResult: applyOperationResult
  });
  const {
    startIconStripBarAreaMove,
    startIconStripBarAreaResize
  } = useSidebarIconStripBarAreaPointerInteraction({
    interaction: sidebarIconStripBarAreaInteraction,
    setInteraction: setSidebarIconStripBarAreaInteraction,
    items,
    metrics,
    setSelection,
    onInteractionStart: closeTransientMenu,
    onOperationResult: applyOperationResult
  });
  const {
    startCompactBarAreaMove,
    startCompactBarAreaResize
  } = useSidebarCompactBarAreaPointerInteraction({
    interaction: sidebarCompactBarAreaInteraction,
    setInteraction: setSidebarCompactBarAreaInteraction,
    items,
    metrics,
    setSelection,
    onInteractionStart: closeTransientMenu,
    onOperationResult: applyOperationResult
  });
  const {
    startMobileButtonMove,
    startMobileButtonResize
  } = useSidebarMobileButtonPointerInteraction({
    interaction: sidebarMobileButtonInteraction,
    setInteraction: setSidebarMobileButtonInteraction,
    items,
    metrics,
    setSelection,
    onInteractionStart: closeTransientMenu,
    onOperationResult: applyOperationResult
  });

  useEffect(() => {
    const signature = createItemsSignature(items);

    if (projectedItemSignaturesRef.current.has(signature)) {
      return;
    }

    sourceItemsRef.current = items;
    sourceMetricsRef.current = metrics;
    projectedItemSignaturesRef.current.clear();
  }, [items]);

  useOperationProbeKeyboard({
    menuTarget,
    selection,
    onCloseMenu: closeItemMenu,
    onOpenSelectedMenu: openSelectedItemMenu,
    onDeleteSelected: deleteSelectedItem,
    onClearSelection: clearSelectedItem
  });

  useEffect(() => () => {
    if (sidebarTextFitToastTimeoutRef.current) {
      window.clearTimeout(sidebarTextFitToastTimeoutRef.current);
    }
  }, []);

  function applyProjectedItems(nextItems, nextMetrics, statusPrefix) {
    projectedItemSignaturesRef.current.add(createItemsSignature(nextItems));
    setItems(nextItems, { projected: true });
    markProjectedItems(statusPrefix);

    if (selection?.type === SELECTION_TYPES.AREA && selection.itemId) {
      setSelection(
        resolveSelectionAfterOperation({ targetId: selection.itemId }, nextItems, nextMetrics)
      );
    }
  }

  function applyOperationResult(command) {
    setLastReport(command.result.report);

    if (command.valid) {
      const compositionCommand = evaluateCompositionItems(command.items, metrics);

      if (!compositionCommand.valid) {
        applyCompositionCommand(compositionCommand);
        return;
      }

      applyCompositionCommand(compositionCommand);
      sourceItemsRef.current = command.items;
      sourceMetricsRef.current = metrics;
      projectedItemSignaturesRef.current.clear();
      setItems(command.items);
      setSelection(command.selection);
      captureLayoutMap(command.items, metrics);
      return;
    }

    // Отказ операции не меняет сцену и не переснимает карту поведения.
    // V2 пересчитывается по текущей сцене, чтобы не оставался старый статус.
    applyCompositionCommand(evaluateCompositionItems(items, metrics));
  }

  function resetProbeState() {
    sourceItemsRef.current = initialOperationProbeItems;
    sourceMetricsRef.current = metrics;
    projectedItemSignaturesRef.current.clear();
    setItems(initialOperationProbeItems);
    setLastReport(null);
    setSelection(null);
    captureLayoutMap(initialOperationProbeItems, metrics);
  }

  function showSidebarTextFitToast(toast) {
    if (sidebarTextFitToastTimeoutRef.current) {
      window.clearTimeout(sidebarTextFitToastTimeoutRef.current);
      sidebarTextFitToastTimeoutRef.current = null;
    }

    if (!toast?.message) {
      setSidebarTextFitToast(null);
      return;
    }

    setSidebarTextFitToast({
      ...toast,
      id: `${toast.itemId}:${toast.code}:${Date.now()}`
    });
    sidebarTextFitToastTimeoutRef.current = window.setTimeout(() => {
      sidebarTextFitToastTimeoutRef.current = null;
      setSidebarTextFitToast(null);
    }, SIDEBAR_TEXT_FIT_TOAST_DURATION_MS);
  }

  function applySidebarStateResult(command) {
    setLastReport(command.result.report);

    if (!command.valid) {
      return;
    }

    if (!command.changed) {
      return;
    }

    sourceItemsRef.current = command.items;
    sourceMetricsRef.current = metrics;
    projectedItemSignaturesRef.current.clear();
    setItems(command.items);
    setSelection(command.selection);
    captureLayoutMap(command.items, metrics, {
      statusPrefix: command.message
    });
    applyCompositionCommand(evaluateCompositionItems(command.items, metrics));
  }

  return {
    panelProps: {
      form,
      items,
      lastReport,
      metrics,
      selection,
      activeBlockType,
      onRunOperation: runOperation,
      onResetProbe: resetProbe,
      onUpdateForm: updateForm,
      onUpdateBlockType: updateBlockType,
      layoutMapStatus,
      onCaptureLayoutMap: () => captureLayoutMap(),
      showLayoutMapOverlay,
      onToggleLayoutMapOverlay: toggleLayoutMapOverlay,
      compositionPlan,
      compositionStatus,
      showCompositionOverlay,
      onInspectComposition: inspectComposition,
      onApplyCompositionFix: applyCompositionFix
    },
    layoutMapOverlayProps: {
      enabled: showLayoutMapOverlay,
      items,
      metrics
    },
    itemProps: {
      items,
      metrics,
      centerToast: sidebarTextFitToast,
      selection,
      compositionPlan,
      showCompositionOverlay,
      activeBlockType,
      onStartMove: (event, item) => {
        const renderInfo = resolveOperationItemRenderInfo(item, items, metrics);

        if (isIconStripShellItem(item, renderInfo)) {
          return startIconStripBarAreaMove(event, item, renderInfo);
        }

        if (isCompactShellItem(item, renderInfo)) {
          return startCompactBarAreaMove(event, item, renderInfo);
        }

        return startBlockMove(event, item);
      },
      onStartResize: (event, item, handle) => {
        const renderInfo = resolveOperationItemRenderInfo(item, items, metrics);

        if (isIconStripShellItem(item, renderInfo)) {
          return startIconStripBarAreaResize(event, item, renderInfo, handle);
        }

        if (isCompactShellItem(item, renderInfo)) {
          return startCompactBarAreaResize(event, item, renderInfo, handle);
        }

        return startBlockResize(event, item, handle);
      },
      menuTarget,
      menuMode,
      renameValue,
      onOpenMenu: openItemMenu,
      onOpenMobileSidebarButtonMenu: openMobileSidebarButtonMenu,
      onOpenSidebarContentItemMenu: openSidebarContentItemMenu,
      onSelectMobileSidebarButton: selectMobileSidebarButton,
      onSelectSidebarContentItem: selectSidebarContentItem,
      onSelectSidebarShell: selectSidebarShell,
      onStartSidebarContentItemMove: startSidebarContentMove,
      onStartSidebarContentItemResize: startSidebarContentResize,
      onStartMobileSidebarButtonMove: startMobileButtonMove,
      onStartMobileSidebarButtonResize: startMobileButtonResize,
      onCloseMenu: closeItemMenu,
      onCopyItem: copyItem,
      onCreateLinkedBlock: createLinkedBlock,
      onDeleteItem: deleteItem,
      onRenameItem: renameItem,
      onRenameSidebarContentItem: renameSidebarContentItem,
      onResetRelationAdaptivePosition: resetRelationAdaptivePosition,
      onSetSidebarSettings: setSidebarSettings,
      onSetSidebarState: setSidebarState,
      onStartRenameSidebarContentItem: startRenameSidebarContentItem,
      onStartRenameItem: startRenameItem,
      onUpdateRenameValue: setRenameValue,
      onUpdateSidebarContentItemGeometry: updateSidebarContentItemGeometry,
      onUpdateSidebarContentItemPatch: updateSidebarContentItemPatch,
      onUpdateSidebarContentItemStyle: updateSidebarContentItemStyle
    }
  };
}

const SIDEBAR_TEXT_FIT_TOAST_DURATION_MS = 4000;

function isIconStripShellItem(item, renderInfo) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" &&
    renderInfo?.mobilePresentation?.mode === SIDEBAR_MOBILE_PRESENTATION_MODES.ICON_STRIP
  );
}

function isCompactShellItem(item, renderInfo) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" &&
    renderInfo?.mobilePresentation?.mode === SIDEBAR_MOBILE_PRESENTATION_MODES.COMPACT_MENU_BUTTON
  );
}

function resolveOperationItemRenderInfo(item, sourceItems, metrics) {
  if (!item) {
    return null;
  }

  const layers = resolveOperationRenderLayers(sourceItems, { metrics });

  return layers.itemRenderInfoById.get(String(item.id)) ?? null;
}
