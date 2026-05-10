import { useEffect, useRef, useState } from "react";
import {
  applyEngineOperationCommand,
  applyCompositionFixCommand,
  ADAPTER_BEHAVIOR_MODES,
  BLOCK_CONTENT_TYPES,
  copyAreaCommand,
  createAdapterLayoutMap,
  createOperationFromForm,
  createPointerInteraction,
  createPointerOperation,
  evaluateCompositionPlanCommand,
  fitItemsToGridCommand,
  formatItemLabel,
  OPERATION_TYPES,
  renameAreaCommand,
  resolveBlockContentType,
  resolveSelectionAfterOperation,
  SELECTION_TYPES,
  shouldPassBehaviorToV2,
  shouldUseAdapterSafetyProjection
} from "../../../engine-adapter/index.js";
import {
  initialOperationProbeForm,
  initialOperationProbeItems
} from "./operationProbeData.js";
import { isMainPointer, isTextInputEvent } from "./operationProbeUtils.js";

const compositionPolicy = {
  spacing: {
    minGap: 1,
    preferredGap: 1
  }
};

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
  const [interaction, setInteraction] = useState(null);
  const [lastReport, setLastReport] = useState(null);
  const [menuTargetId, setMenuTargetId] = useState(null);
  const [menuMode, setMenuMode] = useState("actions");
  const [renameValue, setRenameValue] = useState("");
  const [layoutMap, setLayoutMap] = useState(null);
  const [layoutMapStatus, setLayoutMapStatus] = useState("карта: не сохранена");
  const [showLayoutMapOverlay, setShowLayoutMapOverlay] = useState(false);
  const [compositionPlan, setCompositionPlan] = useState(null);
  const [compositionStatus, setCompositionStatus] = useState("V2: анализ еще не выполнялся");
  const [showCompositionOverlay, setShowCompositionOverlay] = useState(false);
  const [activeBlockType, setActiveBlockType] = useState(BLOCK_CONTENT_TYPES.CONTENT);
  const [form, setForm] = useState(initialOperationProbeForm);

  useEffect(() => {
    const signature = createItemsSignature(items);

    if (projectedItemSignaturesRef.current.has(signature)) {
      projectedItemSignaturesRef.current.delete(signature);
      return;
    }

    sourceItemsRef.current = items;
    sourceMetricsRef.current = metrics;
    projectedItemSignaturesRef.current.clear();
  }, [items]);

  useEffect(() => {
    if (selection?.type !== SELECTION_TYPES.AREA || !selection.item) {
      return;
    }

    setForm((current) => ({
      ...current,
      targetId: selection.item.id,
      x: selection.item.x,
      y: selection.item.y,
      w: selection.item.w,
      h: selection.item.h
    }));
    setActiveBlockType(resolveBlockContentType(selection.item.meta?.blockType));
  }, [selection]);

  useEffect(() => {
    if (!menuTargetId) {
      return undefined;
    }

    function closeByDocumentPointer(event) {
      if (event.target?.closest?.(".grid-operation-item-menu")) {
        return;
      }

      closeItemMenu();
    }

    function closeByEscape(event) {
      if (event.key === "Escape" && !isTextInputEvent(event)) {
        closeItemMenu();
      }
    }

    document.addEventListener("pointerdown", closeByDocumentPointer, true);
    document.addEventListener("keydown", closeByEscape, true);

    return () => {
      document.removeEventListener("pointerdown", closeByDocumentPointer, true);
      document.removeEventListener("keydown", closeByEscape, true);
    };
  }, [menuTargetId]);

  useEffect(() => {
    if (selection?.type !== SELECTION_TYPES.AREA || !selection.item) {
      return undefined;
    }

    function openSelectedMenuByEnter(event) {
      if (event.key !== "Enter" || isTextInputEvent(event)) {
        return;
      }

      event.preventDefault();
      setMenuTargetId(selection.item.id);
      setMenuMode("actions");
      setRenameValue(formatItemLabel(selection.item));
    }

    document.addEventListener("keydown", openSelectedMenuByEnter);

    return () => {
      document.removeEventListener("keydown", openSelectedMenuByEnter);
    };
  }, [selection]);

  useEffect(() => {
    if (selection?.type !== SELECTION_TYPES.AREA || !selection.item) {
      return undefined;
    }

    function deleteSelectedByKeyboard(event) {
      if (event.key !== "Delete" || isTextInputEvent(event)) {
        return;
      }

      event.preventDefault();
      const command = applyEngineOperationCommand({
        items,
        operation: {
          type: OPERATION_TYPES.DELETE_AREA,
          targetId: selection.item.id
        },
        metrics
      });

      setMenuTargetId(null);
      applyOperationResult(command);
    }

    document.addEventListener("keydown", deleteSelectedByKeyboard);

    return () => {
      document.removeEventListener("keydown", deleteSelectedByKeyboard);
    };
  }, [items, metrics, selection]);

  useEffect(() => {
    if (selection?.type !== SELECTION_TYPES.AREA) {
      return undefined;
    }

    function clearSelectedByEscape(event) {
      if (event.key !== "Escape" || isTextInputEvent(event)) {
        return;
      }

      event.preventDefault();
      setSelection(null);
      setMenuTargetId(null);
      setMenuMode("actions");
      setRenameValue("");
    }

    document.addEventListener("keydown", clearSelectedByEscape);

    return () => {
      document.removeEventListener("keydown", clearSelectedByEscape);
    };
  }, [selection, setSelection]);

  useEffect(() => {
    captureLayoutMap(items, metrics, {
      statusPrefix: "Карта создана автоматически"
    });
  }, []);

  useEffect(() => {
    if (interaction) {
      return;
    }

    if (shouldUseAdapterSafetyProjection({ behaviorMode })) {
      const command = fitItemsToGridCommand({
        items: sourceItemsRef.current,
        metrics,
        sourceMetrics: sourceMetricsRef.current
      });

      if (!command.valid) {
        return;
      }

      const compositionCommand = evaluateCompositionItems(command.items, metrics);

      if (!compositionCommand.valid) {
        applyCompositionCommand(compositionCommand);
        return;
      }

      if (!command.changed && areSameItems(items, command.items)) {
        return;
      }

      applyProjectedItems(command.items, metrics, "Блоки вписаны в текущую сетку");
      applyCompositionCommand(compositionCommand);
      return;
    }

    if (!shouldPassBehaviorToV2({ behaviorMode })) {
      return;
    }

    if (behaviorMode === ADAPTER_BEHAVIOR_MODES.SUGGEST) {
      applyCompositionCommand(evaluateCompositionItems(sourceItemsRef.current, metrics));
      return;
    }

    const command = applyCompositionFixCommand({
      items: sourceItemsRef.current,
      metrics,
      sourceMetrics: sourceMetricsRef.current,
      policy: compositionPolicy,
      contentSchemas: createContentSchemasFromItems(sourceItemsRef.current),
      mode: behaviorMode
    });

    applyCompositionCommand(command);

    if (!command.valid) {
      return;
    }

    if (!command.changed && areSameItems(items, command.items)) {
      return;
    }

    applyProjectedItems(command.items, metrics, command.message);
  }, [metrics.columns, metrics.rows, behaviorMode]);

  useEffect(() => {
    if (interaction) {
      return;
    }

    applyCompositionCommand(evaluateCompositionItems(items, metrics));
  }, [items, metrics.columns, metrics.rows]);

  function applyProjectedItems(nextItems, nextMetrics, statusPrefix) {
    projectedItemSignaturesRef.current.add(createItemsSignature(nextItems));
    setItems(nextItems);
    captureLayoutMap(nextItems, nextMetrics, { statusPrefix });

    if (selection?.type === SELECTION_TYPES.AREA && selection.itemId) {
      setSelection(
        resolveSelectionAfterOperation({ targetId: selection.itemId }, nextItems, nextMetrics)
      );
    }
  }

  function runOperation() {
    const operation = createOperationFromForm(form);
    const command = applyEngineOperationCommand({ items, operation, metrics });
    applyOperationResult(command);
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

  function resetProbe() {
    sourceItemsRef.current = initialOperationProbeItems;
    sourceMetricsRef.current = metrics;
    projectedItemSignaturesRef.current.clear();
    setItems(initialOperationProbeItems);
    setLastReport(null);
    setSelection(null);
    setMenuTargetId(null);
    setMenuMode("actions");
    setRenameValue("");
    captureLayoutMap(initialOperationProbeItems, metrics);
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateBlockType(value) {
    const blockType = resolveBlockContentType(value);

    setActiveBlockType(blockType);

    if (selection?.type !== SELECTION_TYPES.AREA || !selection.item) {
      return;
    }

    const command = applyEngineOperationCommand({
      items,
      operation: {
        type: OPERATION_TYPES.SET_AREA,
        targetId: selection.item.id,
        payload: {
          x: selection.item.x,
          y: selection.item.y,
          w: selection.item.w,
          h: selection.item.h
        },
        meta: {
          ...(selection.item.meta ?? {}),
          blockType
        }
      },
      metrics
    });

    applyOperationResult(command);
  }

  function captureLayoutMap(sourceItems = items, sourceMetrics = metrics, options = {}) {
    const command = createAdapterLayoutMap({
      items: sourceItems,
      metrics: sourceMetrics
    });

    if (!command.ok) {
      setLayoutMap(null);
      setLayoutMapStatus(command.message);
      return;
    }

    setLayoutMap(command.data.map);

    setLayoutMapStatus(options.statusPrefix ? `${options.statusPrefix}: ${command.message}` : command.message);
  }

  function toggleLayoutMapOverlay() {
    setShowLayoutMapOverlay((current) => !current);
  }

  function inspectComposition() {
    const command = evaluateCompositionItems(items, metrics);

    applyCompositionCommand(command);
    setShowCompositionOverlay((current) => !current);
    console.log("composition-engine plan", command.plan);
  }

  function applyCompositionFix() {
    const command = applyCompositionFixCommand({
      items: sourceItemsRef.current,
      metrics,
      sourceMetrics: sourceMetricsRef.current,
      policy: compositionPolicy,
      contentSchemas: createContentSchemasFromItems(sourceItemsRef.current)
    });

    applyCompositionCommand(command);

    if (!command.valid) {
      return;
    }

    if (!command.changed && areSameItems(items, command.items)) {
      return;
    }

    applyProjectedItems(command.items, metrics, command.message);
  }

  function startMove(event, item) {
    if (!isMainPointer(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelection(resolveSelectionAfterOperation({ targetId: item.id }, items, metrics));
    setMenuTargetId(null);
    setMenuMode("actions");
    setInteraction(createPointerInteraction({ event, type: "move", item, sourceItems: items, metrics }));
  }

  function startResize(event, item, handle) {
    if (!isMainPointer(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelection(resolveSelectionAfterOperation({ targetId: item.id }, items, metrics));
    setMenuTargetId(null);
    setMenuMode("actions");
    setInteraction(
      createPointerInteraction({ event, type: "resize", handle, item, sourceItems: items, metrics })
    );
  }

  function openItemMenu(event, item) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(resolveSelectionAfterOperation({ targetId: item.id }, items, metrics));
    setMenuTargetId(item.id);
    setMenuMode("actions");
    setRenameValue(formatItemLabel(item));
  }

  function closeItemMenu(event) {
    event?.preventDefault();
    event?.stopPropagation();
    setMenuTargetId(null);
    setMenuMode("actions");
    setRenameValue("");
  }

  function deleteItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    const command = applyEngineOperationCommand({
      items,
      operation: {
        type: OPERATION_TYPES.DELETE_AREA,
        targetId: item.id
      },
      metrics
    });

    setMenuTargetId(null);
    applyOperationResult(command);
  }

  function startRenameItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    setMenuTargetId(item.id);
    setMenuMode("rename");
    setRenameValue(formatItemLabel(item));
  }

  function renameItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    const command = renameAreaCommand({ item, value: renameValue, items, metrics });

    if (command.valid) {
      setMenuTargetId(null);
      setMenuMode("actions");
      setRenameValue("");
    }

    applyOperationResult(command);
  }

  function copyItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    const command = copyAreaCommand({ item, items, metrics });

    setMenuTargetId(null);
    applyOperationResult(command);
  }

  function updatePointerOperation(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const operation = createPointerOperation({ event, interaction, metrics });

    if (!operation) {
      return;
    }

    const command = applyEngineOperationCommand({
      items: interaction.sourceItems,
      operation,
      metrics,
      fallbackItems: interaction.sourceItems
    });
    applyOperationResult(command);
  }

  function finishPointerOperation(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setInteraction(null);
  }

  function evaluateCompositionItems(nextItems, nextMetrics) {
    return evaluateCompositionPlanCommand({
      mode: shouldPassBehaviorToV2({ behaviorMode })
        ? behaviorMode
        : ADAPTER_BEHAVIOR_MODES.SUGGEST,
      items: nextItems,
      metrics: nextMetrics,
      sourceMetrics: sourceMetricsRef.current,
      policy: compositionPolicy,
      contentSchemas: createContentSchemasFromItems(nextItems)
    });
  }

  function applyCompositionCommand(command) {
    const plan = command.plan;

    if (!plan) {
      setCompositionPlan(null);
      setCompositionStatus(command.message ?? "V2: план не создан.");
      return;
    }

    const prefix = command.statusMessage ? `${command.statusMessage} ` : "";

    setCompositionPlan(plan);
    setCompositionStatus(
      command.valid
        ? `${prefix}V2 видит: ${plan.summary.blocks} блоков, ${plan.summary.groups} групп, ${plan.summary.relations} связей, ${plan.summary.issues} сигналов, ${plan.summary.proposals} предложений`
        : `${command.message} ${plan.summary.issues} сигналов, ${plan.summary.proposals} предложений`
    );
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
      selection,
      compositionPlan,
      showCompositionOverlay,
      activeBlockType,
      onStartMove: startMove,
      onStartResize: startResize,
      menuTargetId,
      menuMode,
      renameValue,
      onOpenMenu: openItemMenu,
      onCloseMenu: closeItemMenu,
      onCopyItem: copyItem,
      onDeleteItem: deleteItem,
      onRenameItem: renameItem,
      onStartRenameItem: startRenameItem,
      onUpdateRenameValue: setRenameValue,
      onPointerMove: updatePointerOperation,
      onPointerUp: finishPointerOperation
    }
  };
}

function createContentSchemasFromItems(items) {
  return Object.fromEntries(
    items
      .filter((item) => {
        const hasValue = item?.meta?.value !== undefined && item.meta.value !== null && item.meta.value !== "";
        const hasType = item?.meta?.blockType !== undefined && item.meta.blockType !== null && item.meta.blockType !== "";

        return hasValue || hasType;
      })
      .map((item) => [
        item.id,
        {
          type: resolveBlockContentType(item.meta.blockType),
          value: item.meta.value ?? ""
        }
      ])
  );
}

function areSameItems(leftItems, rightItems) {
  return createItemsSignature(leftItems) === createItemsSignature(rightItems);
}

function createItemsSignature(items) {
  if (!Array.isArray(items)) {
    return "invalid";
  }

  return items
    .map((item) => [
      String(item.id),
      Number(item.x),
      Number(item.y),
      Number(item.w),
      Number(item.h)
    ].join(":"))
    .join("|");
}
