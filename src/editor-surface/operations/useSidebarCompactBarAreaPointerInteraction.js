import { useEffect } from "react";
import {
  applySceneOperationCommand,
  createSidebarCompactBarAreaOperation,
  SIDEBAR_COMPACT_BAR_AREA_POINTER_TYPES,
  createSidebarCompactBarAreaPointerInteraction,
  createSidebarCompactBarAreaPointerMove,
  resolveSelectionAfterOperation
} from "../../../engine-adapter/index.js";
import { isMainPointer } from "./operationProbeUtils.js";

export function useSidebarCompactBarAreaPointerInteraction({
  interaction,
  setInteraction,
  items,
  metrics,
  setSelection,
  onInteractionStart,
  onOperationResult
}) {
  useEffect(() => {
    if (!interaction) {
      return undefined;
    }

    const ownerDocument = interaction.canvasElement?.ownerDocument ??
      (typeof document === "undefined" ? null : document);

    if (!ownerDocument) {
      return undefined;
    }

    ownerDocument.addEventListener("pointermove", updateCompactBarArea, true);
    ownerDocument.addEventListener("pointerup", finishCompactBarArea, true);
    ownerDocument.addEventListener("pointercancel", finishCompactBarArea, true);

    return () => {
      ownerDocument.removeEventListener("pointermove", updateCompactBarArea, true);
      ownerDocument.removeEventListener("pointerup", finishCompactBarArea, true);
      ownerDocument.removeEventListener("pointercancel", finishCompactBarArea, true);
    };
  }, [interaction, metrics]);

  function startCompactBarAreaMove(event, sidebarItem, renderInfo) {
    return startCompactBarAreaPointerOperation(event, sidebarItem, renderInfo, {
      type: SIDEBAR_COMPACT_BAR_AREA_POINTER_TYPES.MOVE
    });
  }

  function startCompactBarAreaResize(event, sidebarItem, renderInfo, handle) {
    return startCompactBarAreaPointerOperation(event, sidebarItem, renderInfo, {
      type: SIDEBAR_COMPACT_BAR_AREA_POINTER_TYPES.RESIZE,
      handle
    });
  }

  function startCompactBarAreaPointerOperation(event, sidebarItem, renderInfo, { type, handle = null }) {
    if (!isMainPointer(event)) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus?.();

    const nextInteraction = createSidebarCompactBarAreaPointerInteraction({
      event,
      type,
      handle,
      sidebarItem,
      renderInfo,
      sourceItems: items,
      metrics
    });

    if (!nextInteraction) {
      return false;
    }

    capturePointer(event.currentTarget, event.pointerId);
    setSelection(resolveSelectionAfterOperation({ targetId: sidebarItem?.id }, items, metrics));
    onInteractionStart?.();
    setInteraction(nextInteraction);
    return true;
  }

  function updateCompactBarArea(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    if (event.buttons === 0) {
      finishCompactBarArea(event);
      return;
    }

    event.preventDefault();

    const move = createSidebarCompactBarAreaPointerMove({
      event,
      interaction,
      metrics: interaction.metrics
    });

    if (!move) {
      return;
    }

    const command = applySceneOperationCommand({
      items: interaction.sourceItems,
      operation: createSidebarCompactBarAreaOperation({
        sidebarItemId: interaction.sidebarItem?.id,
        area: move.compactBarArea
      }),
      metrics: interaction.metrics
    });

    onOperationResult(command);

    if (command.valid) {
      setSelection(
        resolveSelectionAfterOperation({ targetId: interaction.sidebarItem?.id }, command.items, metrics)
      );
    }
  }

  function finishCompactBarArea(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    releasePointer(interaction.pointerCaptureElement, event.pointerId);
    setInteraction(null);
  }

  return {
    startCompactBarAreaMove,
    startCompactBarAreaResize
  };
}

function capturePointer(element, pointerId) {
  try {
    element?.setPointerCapture?.(pointerId);
  } catch {
    // Document-level listeners keep the operation alive if pointer capture is unavailable.
  }
}

function releasePointer(element, pointerId) {
  try {
    element?.releasePointerCapture?.(pointerId);
  } catch {
    // Missing pointer capture should not break operation cleanup.
  }
}
