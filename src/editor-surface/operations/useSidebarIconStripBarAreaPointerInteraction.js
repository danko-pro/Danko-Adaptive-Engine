import { useEffect } from "react";
import {
  applySceneOperationCommand,
  createSidebarIconStripBarAreaOperation,
  SIDEBAR_ICON_STRIP_BAR_AREA_POINTER_TYPES,
  createSidebarIconStripBarAreaPointerInteraction,
  createSidebarIconStripBarAreaPointerMove,
  resolveSelectionAfterOperation
} from "../../../engine-adapter/index.js";
import { isMainPointer } from "./operationProbeUtils.js";

export function useSidebarIconStripBarAreaPointerInteraction({
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

    ownerDocument.addEventListener("pointermove", updateIconStripBarArea, true);
    ownerDocument.addEventListener("pointerup", finishIconStripBarArea, true);
    ownerDocument.addEventListener("pointercancel", finishIconStripBarArea, true);

    return () => {
      ownerDocument.removeEventListener("pointermove", updateIconStripBarArea, true);
      ownerDocument.removeEventListener("pointerup", finishIconStripBarArea, true);
      ownerDocument.removeEventListener("pointercancel", finishIconStripBarArea, true);
    };
  }, [interaction, metrics]);

  function startIconStripBarAreaMove(event, sidebarItem, renderInfo) {
    return startIconStripBarAreaPointerOperation(event, sidebarItem, renderInfo, {
      type: SIDEBAR_ICON_STRIP_BAR_AREA_POINTER_TYPES.MOVE
    });
  }

  function startIconStripBarAreaResize(event, sidebarItem, renderInfo, handle) {
    return startIconStripBarAreaPointerOperation(event, sidebarItem, renderInfo, {
      type: SIDEBAR_ICON_STRIP_BAR_AREA_POINTER_TYPES.RESIZE,
      handle
    });
  }

  function startIconStripBarAreaPointerOperation(event, sidebarItem, renderInfo, { type, handle = null }) {
    if (!isMainPointer(event)) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus?.();

    const nextInteraction = createSidebarIconStripBarAreaPointerInteraction({
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

  function updateIconStripBarArea(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    if (event.buttons === 0) {
      finishIconStripBarArea(event);
      return;
    }

    event.preventDefault();

    const move = createSidebarIconStripBarAreaPointerMove({
      event,
      interaction,
      metrics: interaction.metrics
    });

    if (!move) {
      return;
    }

    const command = applySceneOperationCommand({
      items: interaction.sourceItems,
      operation: createSidebarIconStripBarAreaOperation({
        sidebarItemId: interaction.sidebarItem?.id,
        area: move.barArea
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

  function finishIconStripBarArea(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    releasePointer(interaction.pointerCaptureElement, event.pointerId);
    setInteraction(null);
  }

  return {
    startIconStripBarAreaMove,
    startIconStripBarAreaResize
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
