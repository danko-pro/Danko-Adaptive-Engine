import { useEffect, useRef } from "react";
import {
  MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS,
  resolveMobileSidebarButtonClickAction,
  resolveMobileSidebarButtonDoubleClickAction,
  resolveMobileSidebarButtonPointerMoveState
} from "./mobileSidebarButtonActivationState.js";
import {
  isSelectedMobileSidebarButton
} from "./operationInternalSelection.js";
import {
  createMobileSidebarButtonOperationMenuTarget,
  getOperationMenuTargetKey
} from "./operationMenuTarget.js";
import { resolveMobileSidebarMenuButtonState } from "./mobileSidebarMenuButtonState.js";

export function MobileSidebarMenuButton({
  sidebarItem,
  presentation,
  renderInfo,
  selection,
  open = false,
  itemElementMapRef,
  onSelect,
  onOpenMenu,
  onStartMove,
  onToggle
}) {
  const pointerPressRef = useRef(null);
  const pendingToggleRef = useRef(null);
  const buttonState = resolveMobileSidebarMenuButtonState({ presentation, open });

  useEffect(() => () => {
    cancelPendingMobileSidebarButtonToggle(pendingToggleRef);
  }, []);

  if (!buttonState.visible) {
    return null;
  }

  const buttonArea = presentation.buttonArea;
  const selected = isSelectedMobileSidebarButton(selection, { sidebarItem });
  const anchorKey = getOperationMenuTargetKey(createMobileSidebarButtonOperationMenuTarget({
    sidebarItemId: sidebarItem?.id
  }));

  return (
    <button
      ref={(element) => {
        if (!anchorKey || !itemElementMapRef?.current) {
          return;
        }

        if (element) {
          itemElementMapRef.current.set(anchorKey, element);
          return;
        }

        itemElementMapRef.current.delete(anchorKey);
      }}
      type="button"
      className={[
        buttonState.className,
        selected ? "is-selected" : ""
      ].filter(Boolean).join(" ")}
      aria-label={buttonState.label}
      aria-expanded={open}
      aria-pressed={selected}
      style={{
        gridColumn: `${buttonArea.x} / span ${buttonArea.w}`,
        gridRow: `${buttonArea.y} / span ${buttonArea.h}`
      }}
      onPointerDown={(event) => {
        cancelPendingMobileSidebarButtonToggle(pendingToggleRef);
        pointerPressRef.current = {
          clientX: event.clientX,
          clientY: event.clientY,
          dragged: false
        };

        const started = onStartMove?.(event, sidebarItem, {
          ...renderInfo,
          mobilePresentation: presentation
        });

        if (!started) {
          event.preventDefault();
          event.stopPropagation();
          onSelect?.(event, sidebarItem);
        }
      }}
      onPointerMove={(event) => {
        const nextPointerPress = resolveMobileSidebarButtonPointerMoveState({
          pointerPress: pointerPressRef.current,
          clientX: event.clientX,
          clientY: event.clientY,
          tolerancePx: MOBILE_BUTTON_DRAG_CLICK_TOLERANCE_PX
        });

        if (!nextPointerPress) {
          return;
        }

        pointerPressRef.current = nextPointerPress;

        if (nextPointerPress.dragged) {
          cancelPendingMobileSidebarButtonToggle(pendingToggleRef);
        }
      }}
      onPointerUp={() => {
        window.setTimeout(() => {
          pointerPressRef.current = null;
        }, 50);
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const doubleClickAction = resolveMobileSidebarButtonDoubleClickAction();

        if (doubleClickAction.cancelPending) {
          cancelPendingMobileSidebarButtonToggle(pendingToggleRef);
        }

        pointerPressRef.current = null;
        onOpenMenu?.(event, sidebarItem);
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        const clickAction = resolveMobileSidebarButtonClickAction({
          pointerPress: pointerPressRef.current
        });

        if (clickAction !== MOBILE_SIDEBAR_BUTTON_ACTIVATION_ACTIONS.SCHEDULE_TOGGLE) {
          cancelPendingMobileSidebarButtonToggle(pendingToggleRef);
          return;
        }

        scheduleMobileSidebarButtonToggle({
          pendingToggleRef,
          onToggle
        });
      }}
    >
      {buttonState.glyph}
    </button>
  );
}

const MOBILE_BUTTON_DRAG_CLICK_TOLERANCE_PX = 4;
const MOBILE_BUTTON_CLICK_TOGGLE_DELAY_MS = 220;

function scheduleMobileSidebarButtonToggle({
  pendingToggleRef,
  onToggle
}) {
  cancelPendingMobileSidebarButtonToggle(pendingToggleRef);

  pendingToggleRef.current = window.setTimeout(() => {
    pendingToggleRef.current = null;
    onToggle?.();
  }, MOBILE_BUTTON_CLICK_TOGGLE_DELAY_MS);
}

function cancelPendingMobileSidebarButtonToggle(pendingToggleRef) {
  if (!pendingToggleRef.current) {
    return;
  }

  window.clearTimeout(pendingToggleRef.current);
  pendingToggleRef.current = null;
}
