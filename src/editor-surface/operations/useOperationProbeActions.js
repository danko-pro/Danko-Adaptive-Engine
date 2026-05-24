import { useEffect, useState } from "react";
import {
  applySceneOperationCommand,
  BLOCK_CONTENT_TYPES,
  copyAreaCommand,
  createAreaFromCellCommand,
  createOperationFromForm,
  createSidebarContentItemGeometryOperation,
  createSidebarContentItemPatchOperation,
  createSidebarContentItemStyleOperation,
  createSidebarContentItemTextOperation,
  formatItemLabel,
  OPERATION_TYPES,
  renameAreaCommand,
  resolveBlockContentType,
  resolveSelectionAfterOperation,
  SCENE_OPERATION_TYPES,
  SELECTION_TYPES
} from "../../../engine-adapter/index.js";
import { initialOperationProbeForm } from "./operationProbeData.js";
import {
  createMobileSidebarButtonSelection,
  createSidebarContentItemSelection
} from "./operationInternalSelection.js";
import { createContentSchemasFromItems } from "./operationProbeSceneData.js";
import {
  createAreaOperationMenuTarget,
  createMobileSidebarButtonOperationMenuTarget,
  createSidebarContentOperationMenuTarget
} from "./operationMenuTarget.js";
import { resolveSidebarContentOperationItems } from "./resolveSidebarContentOperationItems.js";
import { resolveSidebarContentTextFitToast } from "./resolveSidebarContentTextFitToast.js";

export function useOperationProbeActions({
  items,
  metrics,
  selection,
  setSelection,
  onOperationResult,
  onResetProbe,
  onSidebarContentTextFitWarning,
  onSidebarStateResult
}) {
  const [menuTarget, setMenuTarget] = useState(null);
  const [menuMode, setMenuMode] = useState("actions");
  const [renameValue, setRenameValue] = useState("");
  const [activeBlockType, setActiveBlockType] = useState(BLOCK_CONTENT_TYPES.CONTENT);
  const [form, setForm] = useState(initialOperationProbeForm);

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

  function runOperation() {
    const operation = createOperationFromForm(form);
    const command = applySceneOperationCommand({ items, operation, metrics });
    onOperationResult(command);
  }

  function resetProbe() {
    onResetProbe();
    setMenuTarget(null);
    setMenuMode("actions");
    setRenameValue("");
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

    const command = applySceneOperationCommand({
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

    onOperationResult(command);
  }

  function closeTransientMenu() {
    setMenuTarget(null);
    setMenuMode("actions");
  }

  function openItemMenu(event, item) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(resolveSelectionAfterOperation({ targetId: item.id }, items, metrics));
    setMenuTarget(createAreaOperationMenuTarget(item));
    setMenuMode("actions");
    setRenameValue(formatItemLabel(item));
  }

  function closeItemMenu(event) {
    event?.preventDefault();
    event?.stopPropagation();
    setMenuTarget(null);
    setMenuMode("actions");
    setRenameValue("");
  }

  function openSelectedItemMenu(event, item) {
    event.preventDefault();
    setMenuTarget(createAreaOperationMenuTarget(item));
    setMenuMode("actions");
    setRenameValue(formatItemLabel(item));
  }

  function deleteSelectedItem(event, item) {
    event.preventDefault();
    const command = createDeleteCommand({ items, item, metrics });

    setMenuTarget(null);
    onOperationResult(command);
  }

  function clearSelectedItem(event) {
    event.preventDefault();
    setSelection(null);
    setMenuTarget(null);
    setMenuMode("actions");
    setRenameValue("");
  }

  function selectSidebarContentItem(event, sidebarItem, contentItem) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(createSidebarContentItemSelection({ sidebarItem, contentItem }));
    setMenuTarget(null);
    setMenuMode("actions");
    setRenameValue("");
  }

  function selectMobileSidebarButton(event, sidebarItem) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(createMobileSidebarButtonSelection({ sidebarItem }));
    setMenuTarget(null);
    setMenuMode("actions");
    setRenameValue("");
  }

  function selectSidebarShell(event, sidebarItem) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(resolveSelectionAfterOperation({ targetId: sidebarItem?.id }, items, metrics));
    setMenuTarget(null);
    setMenuMode("actions");
    setRenameValue("");
  }

  function openSidebarContentItemMenu(event, sidebarItem, contentItem) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(createSidebarContentItemSelection({ sidebarItem, contentItem }));
    setMenuTarget(createSidebarContentOperationMenuTarget({
      sidebarItemId: sidebarItem?.id,
      contentItemId: contentItem?.id
    }));
    setMenuMode("actions");
    setRenameValue(String(contentItem?.text ?? contentItem?.id ?? ""));
  }

  function openMobileSidebarButtonMenu(event, sidebarItem) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(createMobileSidebarButtonSelection({ sidebarItem }));
    setMenuTarget(createMobileSidebarButtonOperationMenuTarget({
      sidebarItemId: sidebarItem?.id
    }));
    setMenuMode("actions");
    setRenameValue(formatItemLabel(sidebarItem));
  }

  function deleteItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    const command = createDeleteCommand({ items, item, metrics });

    setMenuTarget(null);
    onOperationResult(command);
  }

  function startRenameItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    setMenuTarget(createAreaOperationMenuTarget(item));
    setMenuMode("rename");
    setRenameValue(formatItemLabel(item));
  }

  function renameItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    const command = renameAreaCommand({ item, value: renameValue, items, metrics });

    if (command.valid) {
      setMenuTarget(null);
      setMenuMode("actions");
      setRenameValue("");
    }

    onOperationResult(command);
  }

  function startRenameSidebarContentItem(event, sidebarItem, contentItem) {
    event.preventDefault();
    event.stopPropagation();
    setSelection(createSidebarContentItemSelection({ sidebarItem, contentItem }));
    setMenuTarget(createSidebarContentOperationMenuTarget({
      sidebarItemId: sidebarItem?.id,
      contentItemId: contentItem?.id
    }));
    setMenuMode("rename");
    setRenameValue(String(contentItem?.text ?? ""));
  }

  function renameSidebarContentItem(event, sidebarItem, contentItem) {
    event.preventDefault();
    event.stopPropagation();

    const target = createSidebarContentOperationMenuTarget({
      sidebarItemId: sidebarItem?.id,
      contentItemId: contentItem?.id
    });
    const operationItems = resolveSidebarContentOperationItems({
      items,
      sidebarItem
    });
    const command = applySceneOperationCommand({
      items: operationItems,
      operation: createSidebarContentItemTextOperation({
        sidebarItemId: sidebarItem?.id,
        contentItemId: contentItem?.id,
        text: renameValue
      }),
      metrics
    });

    onOperationResult(command);

    if (command.valid) {
      const nextSidebarItem = command.items.find((currentItem) => (
        String(currentItem.id) === String(sidebarItem?.id)
      )) ?? sidebarItem;
      const nextContentItem = command.contentItem ?? contentItem;

      setMenuTarget(target);
      setMenuMode("actions");
      setRenameValue(String(nextContentItem?.text ?? ""));
      setSelection(createSidebarContentItemSelection({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem
      }));
      onSidebarContentTextFitWarning?.(resolveSidebarContentTextFitToast({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem,
        metrics
      }));
    }
  }

  function updateSidebarContentItemStyle(event, sidebarItem, contentItem, stylePatch) {
    event.preventDefault();
    event.stopPropagation();

    const target = createSidebarContentOperationMenuTarget({
      sidebarItemId: sidebarItem?.id,
      contentItemId: contentItem?.id
    });
    const operationItems = resolveSidebarContentOperationItems({
      items,
      sidebarItem
    });
    const command = applySceneOperationCommand({
      items: operationItems,
      operation: createSidebarContentItemStyleOperation({
        sidebarItemId: sidebarItem?.id,
        contentItemId: contentItem?.id,
        style: stylePatch
      }),
      metrics
    });

    onOperationResult(command);

    if (command.valid) {
      const nextSidebarItem = command.items.find((currentItem) => (
        String(currentItem.id) === String(sidebarItem?.id)
      )) ?? sidebarItem;
      const nextContentItem = command.contentItem ?? contentItem;

      setMenuTarget(target);
      setMenuMode("actions");
      setRenameValue(String(nextContentItem?.text ?? ""));
      setSelection(createSidebarContentItemSelection({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem
      }));
      onSidebarContentTextFitWarning?.(resolveSidebarContentTextFitToast({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem,
        metrics
      }));
    }
  }

  function updateSidebarContentItemPatch(event, sidebarItem, contentItem, contentItemPatch) {
    event.preventDefault();
    event.stopPropagation();

    const target = createSidebarContentOperationMenuTarget({
      sidebarItemId: sidebarItem?.id,
      contentItemId: contentItem?.id
    });
    const operationItems = resolveSidebarContentOperationItems({
      items,
      sidebarItem
    });
    const command = applySceneOperationCommand({
      items: operationItems,
      operation: createSidebarContentItemPatchOperation({
        sidebarItemId: sidebarItem?.id,
        contentItemId: contentItem?.id,
        patch: contentItemPatch
      }),
      metrics
    });

    onOperationResult(command);

    if (command.valid) {
      const nextSidebarItem = command.items.find((currentItem) => (
        String(currentItem.id) === String(sidebarItem?.id)
      )) ?? sidebarItem;
      const nextContentItem = command.contentItem ?? contentItem;

      setMenuTarget(target);
      setMenuMode("actions");
      setRenameValue(String(nextContentItem?.text ?? ""));
      setSelection(createSidebarContentItemSelection({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem
      }));
      onSidebarContentTextFitWarning?.(resolveSidebarContentTextFitToast({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem,
        metrics
      }));
    }
  }

  function updateSidebarContentItemGeometry(event, sidebarItem, contentItem, areaPatch) {
    event.preventDefault();
    event.stopPropagation();

    const target = createSidebarContentOperationMenuTarget({
      sidebarItemId: sidebarItem?.id,
      contentItemId: contentItem?.id
    });
    const operationItems = resolveSidebarContentOperationItems({
      items,
      sidebarItem
    });
    const command = applySceneOperationCommand({
      items: operationItems,
      operation: createSidebarContentItemGeometryOperation({
        sidebarItemId: sidebarItem?.id,
        contentItemId: contentItem?.id,
        area: areaPatch
      }),
      metrics
    });

    onOperationResult(command);

    if (command.valid) {
      const nextSidebarItem = command.items.find((currentItem) => (
        String(currentItem.id) === String(sidebarItem?.id)
      )) ?? sidebarItem;
      const nextContentItem = command.contentItem ?? contentItem;

      setMenuTarget(target);
      setMenuMode("actions");
      setRenameValue(String(nextContentItem?.text ?? ""));
      setSelection(createSidebarContentItemSelection({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem
      }));
      onSidebarContentTextFitWarning?.(resolveSidebarContentTextFitToast({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem,
        metrics
      }));
    }
  }

  function copyItem(event, item) {
    event.preventDefault();
    event.stopPropagation();
    const command = copyAreaCommand({ item, items, metrics });

    setMenuTarget(null);
    onOperationResult(command);
  }

  function createLinkedBlock(event, item, blockType) {
    event.preventDefault();
    event.stopPropagation();

    const resolvedBlockType = resolveBlockContentType(blockType);
    const size = resolveLinkedBlockSize(item, resolvedBlockType);
    const value = resolveLinkedBlockValue(resolvedBlockType);
    const command = createLinkedBlockCommand({
      item,
      items,
      metrics,
      size,
      value,
      blockType: resolvedBlockType
    });

    if (command.valid) {
      setMenuTarget(null);
      setMenuMode("actions");
      setRenameValue("");
    }

    onOperationResult(command);
  }

  function setSidebarState(event, item, state) {
    return setSidebarSettings(event, item, { state });
  }

  function setSidebarSettings(event, item, settings) {
    event.preventDefault();
    event.stopPropagation();

    const command = applySceneOperationCommand({
      items,
      operation: {
        type: SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS,
        targetId: item.id,
        payload: {
          settings
        }
      },
      metrics,
      contentSchemas: createContentSchemasFromItems(items)
    });

    setMenuTarget(createAreaOperationMenuTarget(item));
    setMenuMode("actions");
    setRenameValue(formatItemLabel(command.items.find((currentItem) => String(currentItem.id) === String(item.id)) ?? item));
    onSidebarStateResult(command);
  }

  return {
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
    resetProbe,
    runOperation,
    selectSidebarContentItem,
    selectSidebarShell,
    selectMobileSidebarButton,
    setRenameValue,
    setSidebarState,
    setSidebarSettings,
    startRenameSidebarContentItem,
    startRenameItem,
    updateBlockType,
    updateForm,
    updateSidebarContentItemGeometry,
    updateSidebarContentItemPatch,
    updateSidebarContentItemStyle
  };
}

function createLinkedBlockCommand({ item, items, metrics, size, value, blockType }) {
  const candidates = createLinkedBlockCandidates({ item, size, metrics });
  let lastCommand = null;

  for (const cell of candidates) {
    const command = createAreaFromCellCommand({
      cell,
      size,
      value,
      blockType,
      items,
      metrics,
      meta: {
        dependencies: [item.id]
      }
    });

    lastCommand = command;

    if (command.valid) {
      return command;
    }
  }

  return lastCommand ?? createAreaFromCellCommand({
    cell: { x: item.x, y: item.y },
    size,
    value,
    blockType,
    items,
    metrics,
    meta: {
      dependencies: [item.id]
    }
  });
}

function createLinkedBlockCandidates({ item, size, metrics }) {
  const directCandidates = [
    { x: item.x + item.w + 1, y: item.y },
    { x: item.x, y: item.y + item.h + 1 },
    { x: item.x - size.w - 1, y: item.y },
    { x: item.x, y: item.y - size.h - 1 }
  ];
  const normalizedDirectCandidates = directCandidates
    .map((cell) => normalizeCandidateCell({ cell, size, metrics }))
    .filter(Boolean);
  const scanCandidates = createScannedCandidateCells({ item, size, metrics });
  const seen = new Set();

  return [...normalizedDirectCandidates, ...scanCandidates].filter((cell) => {
    const key = `${cell.x}:${cell.y}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function createScannedCandidateCells({ item, size, metrics }) {
  const maxX = Math.max(1, Number(metrics?.columns ?? 1) - size.w + 1);
  const maxY = Math.max(1, Number(metrics?.rows ?? 1) - size.h + 1);
  const origin = {
    x: item.x + item.w,
    y: item.y + Math.floor(item.h / 2)
  };
  const candidates = [];

  for (let y = 1; y <= maxY; y += 1) {
    for (let x = 1; x <= maxX; x += 1) {
      candidates.push({
        x,
        y,
        distance: Math.abs(x - origin.x) + Math.abs(y - origin.y)
      });
    }
  }

  return candidates
    .sort((left, right) => left.distance - right.distance)
    .map(({ x, y }) => ({ x, y }));
}

function normalizeCandidateCell({ cell, size, metrics }) {
  const maxX = Number(metrics?.columns ?? 0) - size.w + 1;
  const maxY = Number(metrics?.rows ?? 0) - size.h + 1;

  if (maxX < 1 || maxY < 1) {
    return null;
  }

  return {
    x: clampNumber(cell.x, 1, maxX),
    y: clampNumber(cell.y, 1, maxY)
  };
}

function resolveLinkedBlockSize(item, blockType) {
  const baseWidth = blockType === BLOCK_CONTENT_TYPES.WARNING ? 4 : 5;
  const baseHeight = blockType === BLOCK_CONTENT_TYPES.WARNING ? 3 : 2;

  return {
    w: Math.max(2, Math.min(baseWidth, Math.ceil(Number(item?.w ?? baseWidth) / 2))),
    h: Math.max(2, Math.min(baseHeight, Math.ceil(Number(item?.h ?? baseHeight) / 2)))
  };
}

function resolveLinkedBlockValue(blockType) {
  if (blockType === BLOCK_CONTENT_TYPES.WARNING) {
    return "Опасность";
  }

  if (blockType === BLOCK_CONTENT_TYPES.CONTROL) {
    return "Контроль";
  }

  return "Связанный блок";
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function createDeleteCommand({ items, item, metrics }) {
  return applySceneOperationCommand({
    items,
    operation: {
      type: OPERATION_TYPES.DELETE_AREA,
      targetId: item.id
    },
    metrics
  });
}
