import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ItemActionMenu } from "./ItemActionMenu.jsx";
import {
  resolveDraggedOperationMenuPosition,
  resolveOperationMenuPosition
} from "./resolveOperationMenuPosition.js";
import { canStartOperationMenuDrag } from "./operationMenuDragIntent.js";
import {
  getOperationMenuTargetAnchorKey,
  getOperationMenuTargetKey
} from "./operationMenuTarget.js";

export function OperationMenuLayer({
  target,
  item,
  items,
  itemElementMapRef,
  mode,
  renameValue,
  onClose,
  onCopy,
  onCreateLinkedBlock,
  onDelete,
  onRename,
  onRenameSidebarContentItem,
  relationResetAction,
  onResetRelationAdaptivePosition,
  onSetSidebarSettings,
  onSetSidebarState,
  onStartRenameSidebarContentItem,
  onStartRename,
  onUpdateRenameValue,
  onUpdateSidebarContentItemGeometry,
  onUpdateSidebarContentItemPatch,
  onUpdateSidebarContentItemStyle
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [dragSession, setDragSession] = useState(null);
  const menuRef = useRef(null);
  const targetAnchorKey = getOperationMenuTargetAnchorKey(target);
  const targetKey = getOperationMenuTargetKey(target);

  useEffect(() => {
    if (!item || !targetAnchorKey) {
      setMenuAnchor(null);
      setMenuPosition(null);
      setDragPosition(null);
      setDragSession(null);
      return undefined;
    }

    function updateAnchor() {
      const element = itemElementMapRef.current.get(String(targetAnchorKey));

      if (!element) {
        setMenuAnchor(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const workspaceRect = resolveWorkspaceRect(element);
      setMenuAnchor({
        centerX: rect.left + rect.width / 2,
        top: rect.top,
        bottom: rect.bottom,
        workspaceRect
      });
      if (!dragPosition) {
        setMenuPosition(null);
      }
    }

    updateAnchor();

    window.addEventListener("resize", updateAnchor);
    document.addEventListener("scroll", updateAnchor, true);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      document.removeEventListener("scroll", updateAnchor, true);
    };
  }, [item, items, itemElementMapRef, dragPosition, targetAnchorKey, targetKey]);

  useLayoutEffect(() => {
    if (!menuAnchor || !menuRef.current) {
      return;
    }

    const menuRect = menuRef.current.getBoundingClientRect();
    const menuSize = {
      width: menuRect.width,
      height: menuRect.height
    };
    const nextPosition = dragPosition
      ? resolveDraggedOperationMenuPosition({
          position: dragPosition,
          menuSize,
          viewportRect: resolveViewportRect(),
          workspaceRect: menuAnchor.workspaceRect
        })
      : resolveOperationMenuPosition({
          anchor: menuAnchor,
          menuSize,
          viewportRect: resolveViewportRect(),
          workspaceRect: menuAnchor.workspaceRect
        });

    setMenuPosition((currentPosition) => {
      if (
        currentPosition &&
        currentPosition.left === nextPosition.left &&
        currentPosition.top === nextPosition.top
      ) {
        return currentPosition;
      }

      return nextPosition;
    });
  }, [item, targetKey, menuAnchor, mode, renameValue, dragPosition]);

  useEffect(() => {
    if (!dragSession) {
      return undefined;
    }

    function moveMenu(event) {
      if (event.pointerId !== dragSession.pointerId || !menuRef.current) {
        return;
      }

      event.preventDefault();
      const menuRect = menuRef.current.getBoundingClientRect();
      const nextPosition = resolveDraggedOperationMenuPosition({
        position: dragSession.startPosition,
        delta: {
          x: event.clientX - dragSession.startPointer.x,
          y: event.clientY - dragSession.startPointer.y
        },
        menuSize: {
          width: menuRect.width,
          height: menuRect.height
        },
        viewportRect: resolveViewportRect(),
        workspaceRect: menuAnchor?.workspaceRect
      });

      setDragPosition(nextPosition);
      setMenuPosition(nextPosition);
    }

    function finishMenuDrag(event) {
      if (event.pointerId !== dragSession.pointerId) {
        return;
      }

      releasePointerCapture(menuRef.current, event.pointerId);
      setDragSession(null);
    }

    document.addEventListener("pointermove", moveMenu, true);
    document.addEventListener("pointerup", finishMenuDrag, true);
    document.addEventListener("pointercancel", finishMenuDrag, true);

    return () => {
      document.removeEventListener("pointermove", moveMenu, true);
      document.removeEventListener("pointerup", finishMenuDrag, true);
      document.removeEventListener("pointercancel", finishMenuDrag, true);
    };
  }, [dragSession, menuAnchor]);

  if (!item || !menuAnchor) {
    return null;
  }

  function startMenuDrag(event) {
    if (!canStartOperationMenuDrag({
      button: event.button,
      target: event.target,
      hasPosition: Boolean(menuPosition)
    })) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    capturePointer(event.currentTarget, event.pointerId);
    setDragSession({
      pointerId: event.pointerId,
      startPointer: {
        x: event.clientX,
        y: event.clientY
      },
      startPosition: menuPosition
    });
  }

  return createPortal(
    <div
      ref={menuRef}
      className={[
        "grid-operation-item-menu-portal",
        dragSession ? "is-dragging" : ""
      ].filter(Boolean).join(" ")}
      style={{
        left: `${menuPosition?.left ?? menuAnchor.centerX}px`,
        top: `${menuPosition?.top ?? menuAnchor.top}px`,
        visibility: menuPosition ? "visible" : "hidden"
      }}
      onPointerDownCapture={startMenuDrag}
    >
      <ItemActionMenu
        floating
        target={target}
        item={item}
        mode={mode}
        renameValue={renameValue}
        onClose={onClose}
        onCopy={onCopy}
        onCreateLinkedBlock={onCreateLinkedBlock}
        onDelete={onDelete}
        onRename={onRename}
        onRenameSidebarContentItem={onRenameSidebarContentItem}
        relationResetAction={relationResetAction}
        onResetRelationAdaptivePosition={onResetRelationAdaptivePosition}
        onSetSidebarSettings={onSetSidebarSettings}
        onSetSidebarState={onSetSidebarState}
        onStartRenameSidebarContentItem={onStartRenameSidebarContentItem}
        onStartRename={onStartRename}
        onUpdateRenameValue={onUpdateRenameValue}
        onUpdateSidebarContentItemGeometry={onUpdateSidebarContentItemGeometry}
        onUpdateSidebarContentItemPatch={onUpdateSidebarContentItemPatch}
        onUpdateSidebarContentItemStyle={onUpdateSidebarContentItemStyle}
      />
    </div>,
    document.body
  );
}

function resolveWorkspaceRect(element) {
  const workspaceElement = element.closest?.(".layout-workspace") ?? element.closest?.(".layout-canvas");
  const rect = workspaceElement?.getBoundingClientRect?.();

  if (!rect) {
    return resolveViewportRect();
  }

  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom
  };
}

function resolveViewportRect() {
  const width = window.innerWidth || document.documentElement.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight;

  return {
    left: 0,
    top: 0,
    right: width,
    bottom: height
  };
}

function capturePointer(element, pointerId) {
  try {
    element?.setPointerCapture?.(pointerId);
  } catch {
    // Document-level listeners still keep drag alive if pointer capture is unavailable.
  }
}

function releasePointerCapture(element, pointerId) {
  try {
    element?.releasePointerCapture?.(pointerId);
  } catch {
    // Losing pointer capture should not break menu drag cleanup.
  }
}
