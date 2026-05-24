import {
  applySceneOperationCommand,
  createSidebarContentItemGeometryOperation
} from "../../../engine-adapter/index.js";
import {
  SIDEBAR_CONTENT_GEOMETRY_TARGETS,
  SIDEBAR_CONTENT_POINTER_TYPES,
  createSidebarContentItemPointerInteraction,
  createSidebarContentItemPointerMove
} from "../../../sidebar-element/index.js";
import { createSidebarContentItemSelection } from "./operationInternalSelection.js";
import { isMainPointer } from "./operationProbeUtils.js";
import { resolveSidebarContentOperationItems } from "./resolveSidebarContentOperationItems.js";
import { useEffect } from "react";

export function useSidebarContentPointerInteraction({
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

    const ownerDocument = interaction.gridElement?.ownerDocument ??
      (typeof document === "undefined" ? null : document);

    if (!ownerDocument) {
      return undefined;
    }

    ownerDocument.addEventListener("pointermove", updateSidebarContentMove, true);
    ownerDocument.addEventListener("pointerup", finishSidebarContentMove, true);
    ownerDocument.addEventListener("pointercancel", finishSidebarContentMove, true);

    return () => {
      ownerDocument.removeEventListener("pointermove", updateSidebarContentMove, true);
      ownerDocument.removeEventListener("pointerup", finishSidebarContentMove, true);
      ownerDocument.removeEventListener("pointercancel", finishSidebarContentMove, true);
    };
  }, [interaction, metrics]);

  function startSidebarContentMove(event, sidebarItem, contentItem, content) {
    return startSidebarContentPointerOperation(event, sidebarItem, contentItem, content, {
      type: SIDEBAR_CONTENT_POINTER_TYPES.MOVE
    });
  }

  function startSidebarContentResize(event, sidebarItem, contentItem, content, handle) {
    return startSidebarContentPointerOperation(event, sidebarItem, contentItem, content, {
      type: SIDEBAR_CONTENT_POINTER_TYPES.RESIZE,
      handle
    });
  }

  function startSidebarContentPointerOperation(event, sidebarItem, contentItem, content, { type, handle = null }) {
    if (!isMainPointer(event)) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();

    const nextInteraction = createSidebarContentItemPointerInteraction({
      event,
      type,
      handle,
      sidebarItem,
      contentItem,
      content,
      sourceItems: items,
      metrics
    });

    if (!nextInteraction) {
      return false;
    }

    capturePointer(event.currentTarget, event.pointerId);
    setSelection(createSidebarContentItemSelection({ sidebarItem, contentItem }));
    onInteractionStart?.();
    setInteraction(nextInteraction);
    return true;
  }

  function updateSidebarContentMove(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    if (event.buttons === 0) {
      finishSidebarContentMove(event);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const move = createSidebarContentItemPointerMove({ event, interaction });

    if (!move) {
      return;
    }

    const operationItems = resolveSidebarContentOperationItems({
      items: interaction.sourceItems,
      sidebarItem: interaction.sidebarItem,
      content: interaction.content
    });
    const command = applySceneOperationCommand({
      items: operationItems,
      operation: createSidebarContentItemGeometryOperation({
        sidebarItemId: interaction.sidebarItem?.id,
        contentItemId: interaction.startItem?.id,
        area: move.area,
        geometryTarget: interaction.content?.geometryTarget ?? SIDEBAR_CONTENT_GEOMETRY_TARGETS.DESKTOP,
        viewportArea: interaction.content?.viewportArea ?? null
      }),
      metrics: interaction.metrics
    });

    onOperationResult(command);

    if (command.valid) {
      const nextSidebarItem = command.items.find((item) => (
        String(item.id) === String(interaction.sidebarItem?.id)
      )) ?? interaction.sidebarItem;
      const nextContentItem = command.contentItem ?? interaction.startItem;

      setSelection(createSidebarContentItemSelection({
        sidebarItem: nextSidebarItem,
        contentItem: nextContentItem
      }));
    }
  }

  function finishSidebarContentMove(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    releasePointer(interaction.pointerCaptureElement, event.pointerId);
    setInteraction(null);
  }

  return {
    startSidebarContentMove,
    startSidebarContentResize
  };
}

function capturePointer(element, pointerId) {
  if (!element?.setPointerCapture) {
    return;
  }

  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Захват pointer ускоряет drag, но document-level listeners держат движение живым и без capture.
  }
}

function releasePointer(element, pointerId) {
  if (!element?.releasePointerCapture) {
    return;
  }

  if (element.hasPointerCapture?.(pointerId) === false) {
    return;
  }

  try {
    element.releasePointerCapture(pointerId);
  } catch {
    // Потерянный capture не должен ломать завершение внутреннего drag.
  }
}
