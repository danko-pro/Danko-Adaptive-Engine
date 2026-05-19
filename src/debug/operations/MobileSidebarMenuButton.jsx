import { useRef } from "react";
import {
  isSelectedMobileSidebarButton
} from "./operationInternalSelection.js";
import { getOperationMenuTargetKey, createMobileSidebarButtonOperationMenuTarget } from "./operationMenuTarget.js";
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
  const buttonState = resolveMobileSidebarMenuButtonState({ presentation, open });

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
        const pointerPress = pointerPressRef.current;

        if (!pointerPress) {
          return;
        }

        if (
          Math.abs(Number(event.clientX) - pointerPress.clientX) > MOBILE_BUTTON_DRAG_CLICK_TOLERANCE_PX ||
          Math.abs(Number(event.clientY) - pointerPress.clientY) > MOBILE_BUTTON_DRAG_CLICK_TOLERANCE_PX
        ) {
          pointerPress.dragged = true;
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
        onOpenMenu?.(event, sidebarItem);
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (pointerPressRef.current?.dragged) {
          return;
        }

        onToggle?.();
      }}
    >
      {buttonState.glyph}
    </button>
  );
}

const MOBILE_BUTTON_DRAG_CLICK_TOLERANCE_PX = 4;
