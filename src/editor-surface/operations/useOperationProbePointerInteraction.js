import { useEffect } from "react";
import {
  applySceneOperationCommand,
  createPointerInteraction,
  createPointerOperation,
  resolveSelectionAfterOperation
} from "../../../engine-adapter/index.js";
import { isMainPointer } from "./operationProbeUtils.js";
import { resolveRelationManualMoveCommand } from "./resolveRelationManualMoveCommand.js";

export function useOperationProbePointerInteraction({
  interaction,
  setInteraction,
  items,
  metrics,
  setSelection,
  onInteractionStart,
  onOperationResult,
  onProjectItems
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

    // Активный drag слушается на document, потому что resize-handle живет
    // в отдельном controls layer и не обязан отдавать move/up события блоку.
    ownerDocument.addEventListener("pointermove", updatePointerOperation, true);
    ownerDocument.addEventListener("pointerup", finishPointerOperation, true);
    ownerDocument.addEventListener("pointercancel", finishPointerOperation, true);

    return () => {
      ownerDocument.removeEventListener("pointermove", updatePointerOperation, true);
      ownerDocument.removeEventListener("pointerup", finishPointerOperation, true);
      ownerDocument.removeEventListener("pointercancel", finishPointerOperation, true);
    };
  }, [interaction, metrics]);

  function startMove(event, item) {
    if (!isMainPointer(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus();
    capturePointer(event.currentTarget, event.pointerId);
    setSelection(resolveSelectionAfterOperation({ targetId: item.id }, items, metrics));
    onInteractionStart();
    setInteraction(createPointerInteraction({ event, type: "move", item, sourceItems: items, metrics }));
  }

  function startResize(event, item, handle) {
    if (!isMainPointer(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    capturePointer(event.currentTarget, event.pointerId);
    setSelection(resolveSelectionAfterOperation({ targetId: item.id }, items, metrics));
    onInteractionStart();
    setInteraction(
      createPointerInteraction({ event, type: "resize", handle, item, sourceItems: items, metrics })
    );
  }

  function updatePointerOperation(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    // Если pointerup потерялся, следующий pointermove без зажатой кнопки
    // завершает drag и не дает старому interaction продолжать менять блок.
    if (event.buttons === 0) {
      finishPointerOperation(event);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const operation = createPointerOperation({ event, interaction, metrics });

    if (!operation) {
      return;
    }

    if (interaction.type === "move") {
      const manualMove = resolveRelationManualMoveCommand({
        items: interaction.sourceItems,
        item: interaction.startItem,
        metrics,
        nextArea: {
          x: operation.payload.x,
          y: operation.payload.y,
          w: interaction.startItem.w,
          h: interaction.startItem.h
        }
      });

      if (manualMove) {
        onOperationResult(manualMove.command);

        if (manualMove.projection && onProjectItems) {
          onProjectItems(
            manualMove.projection.data.items,
            metrics,
            manualMove.projection.message
          );
        }

        return;
      }
    }

    const command = applySceneOperationCommand({
      items: interaction.sourceItems,
      operation,
      metrics,
      fallbackItems: interaction.sourceItems
    });
    onOperationResult(command);
  }

  function finishPointerOperation(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    releasePointer(interaction.pointerCaptureElement, event.pointerId);
    setInteraction(null);
  }

  return {
    startMove,
    startResize,
    updatePointerOperation,
    finishPointerOperation
  };
}

function capturePointer(element, pointerId) {
  if (!element?.setPointerCapture) {
    return;
  }

  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Захват pointer - удобная оптимизация, но document-level listeners
    // все равно держат drag живым, если браузер отказал в capture.
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
    // Потерянный capture не должен ломать завершение interaction.
  }
}
