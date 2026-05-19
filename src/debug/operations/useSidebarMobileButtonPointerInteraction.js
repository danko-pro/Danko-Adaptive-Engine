import { useEffect } from "react";
import { applySceneOperationCommand } from "../../../engine-adapter/index.js";
import { createMobileSidebarButtonSelection } from "./operationInternalSelection.js";
import { isMainPointer } from "./operationProbeUtils.js";
import { createSidebarMobileButtonAreaOperation } from "./sidebarMobileButtonAreaOperation.js";
import {
  SIDEBAR_MOBILE_BUTTON_POINTER_TYPES,
  createSidebarMobileButtonPointerInteraction,
  createSidebarMobileButtonPointerMove
} from "./sidebarMobileButtonPointerOperation.js";

export function useSidebarMobileButtonPointerInteraction({
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

    ownerDocument.addEventListener("pointermove", updateMobileButtonArea, true);
    ownerDocument.addEventListener("pointerup", finishMobileButtonArea, true);
    ownerDocument.addEventListener("pointercancel", finishMobileButtonArea, true);

    return () => {
      ownerDocument.removeEventListener("pointermove", updateMobileButtonArea, true);
      ownerDocument.removeEventListener("pointerup", finishMobileButtonArea, true);
      ownerDocument.removeEventListener("pointercancel", finishMobileButtonArea, true);
    };
  }, [interaction, metrics]);

  function startMobileButtonMove(event, sidebarItem, renderInfo) {
    return startMobileButtonPointerOperation(event, sidebarItem, renderInfo, {
      type: SIDEBAR_MOBILE_BUTTON_POINTER_TYPES.MOVE
    });
  }

  function startMobileButtonResize(event, sidebarItem, renderInfo, handle) {
    return startMobileButtonPointerOperation(event, sidebarItem, renderInfo, {
      type: SIDEBAR_MOBILE_BUTTON_POINTER_TYPES.RESIZE,
      handle
    });
  }

  function startMobileButtonPointerOperation(event, sidebarItem, renderInfo, { type, handle = null }) {
    if (!isMainPointer(event)) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus?.();

    const nextInteraction = createSidebarMobileButtonPointerInteraction({
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
    setSelection(createMobileSidebarButtonSelection({ sidebarItem }));
    onInteractionStart?.();
    setInteraction(nextInteraction);
    return true;
  }

  function updateMobileButtonArea(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    if (event.buttons === 0) {
      finishMobileButtonArea(event);
      return;
    }

    event.preventDefault();

    const move = createSidebarMobileButtonPointerMove({
      event,
      interaction,
      metrics: interaction.metrics
    });

    if (!move) {
      return;
    }

    const command = applySceneOperationCommand({
      items: interaction.sourceItems,
      operation: createSidebarMobileButtonAreaOperation({
        sidebarItemId: interaction.sidebarItem?.id,
        area: move.relativeArea
      }),
      metrics: interaction.metrics
    });

    onOperationResult(command);

    if (command.valid) {
      const nextSidebarItem = command.items.find((item) => (
        String(item.id) === String(interaction.sidebarItem?.id)
      )) ?? interaction.sidebarItem;

      setSelection(createMobileSidebarButtonSelection({
        sidebarItem: nextSidebarItem
      }));
    }
  }

  function finishMobileButtonArea(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    releasePointer(interaction.pointerCaptureElement, event.pointerId);
    setInteraction(null);
  }

  return {
    startMobileButtonMove,
    startMobileButtonResize
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
