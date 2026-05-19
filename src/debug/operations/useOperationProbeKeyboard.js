import { useEffect } from "react";
import { SELECTION_TYPES } from "../../../engine-adapter/index.js";
import {
  isMobileSidebarButtonSelection,
  isSidebarContentItemSelection
} from "./operationInternalSelection.js";
import { isTextInputEvent } from "./operationProbeUtils.js";

export function useOperationProbeKeyboard({
  menuTarget,
  selection,
  onCloseMenu,
  onOpenSelectedMenu,
  onDeleteSelected,
  onClearSelection
}) {
  useEffect(() => {
    if (!menuTarget) {
      return undefined;
    }

    function closeByDocumentPointer(event) {
      if (event.target?.closest?.(".grid-operation-item-menu")) {
        return;
      }

      onCloseMenu();
    }

    function closeByEscape(event) {
      if (event.key === "Escape" && !isTextInputEvent(event)) {
        onCloseMenu();
      }
    }

    document.addEventListener("pointerdown", closeByDocumentPointer, true);
    document.addEventListener("keydown", closeByEscape, true);

    return () => {
      document.removeEventListener("pointerdown", closeByDocumentPointer, true);
      document.removeEventListener("keydown", closeByEscape, true);
    };
  }, [menuTarget, onCloseMenu]);

  useEffect(() => {
    if (selection?.type !== SELECTION_TYPES.AREA || !selection.item) {
      return undefined;
    }

    function openSelectedMenuByEnter(event) {
      if (event.key !== "Enter" || isTextInputEvent(event)) {
        return;
      }

      onOpenSelectedMenu(event, selection.item);
    }

    document.addEventListener("keydown", openSelectedMenuByEnter);

    return () => {
      document.removeEventListener("keydown", openSelectedMenuByEnter);
    };
  }, [selection, onOpenSelectedMenu]);

  useEffect(() => {
    if (selection?.type !== SELECTION_TYPES.AREA || !selection.item) {
      return undefined;
    }

    function deleteSelectedByKeyboard(event) {
      if (event.key !== "Delete" || isTextInputEvent(event)) {
        return;
      }

      onDeleteSelected(event, selection.item);
    }

    document.addEventListener("keydown", deleteSelectedByKeyboard);

    return () => {
      document.removeEventListener("keydown", deleteSelectedByKeyboard);
    };
  }, [selection, onDeleteSelected]);

  useEffect(() => {
    if (!isClearableOperationSelection(selection)) {
      return undefined;
    }

    function clearSelectedByEscape(event) {
      if (event.key !== "Escape" || isTextInputEvent(event)) {
        return;
      }

      onClearSelection(event);
    }

    document.addEventListener("keydown", clearSelectedByEscape);

    return () => {
      document.removeEventListener("keydown", clearSelectedByEscape);
    };
  }, [selection, onClearSelection]);
}

function isClearableOperationSelection(selection) {
  return (
    selection?.type === SELECTION_TYPES.AREA ||
    isMobileSidebarButtonSelection(selection) ||
    isSidebarContentItemSelection(selection)
  );
}
