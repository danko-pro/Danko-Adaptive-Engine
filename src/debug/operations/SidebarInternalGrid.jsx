import { useEffect, useRef, useState } from "react";
import {
  SIDEBAR_CONTENT_FONT_FAMILIES,
  SIDEBAR_CONTENT_TEXT_ALIGNS
} from "../../../sidebar-element/index.js";
import { isSelectedSidebarContentItem } from "./operationInternalSelection.js";
import {
  handleSidebarContentKeyboardBoundary,
  handleSidebarContentPointerBoundary,
  stopSidebarContentBoundaryEvent
} from "./operationSidebarContentEventBoundary.js";
import {
  createSidebarContentOperationMenuTarget,
  getOperationMenuTargetAnchorKey
} from "./operationMenuTarget.js";
import { ResizeHandles } from "./ResizeHandles.jsx";
import {
  resolveSidebarInternalGridContent,
  resolveSidebarInternalGridStyle
} from "./resolveSidebarInternalGridStyle.js";
import { getSidebarContentItemClassName } from "./resolveSidebarContentItemClassName.js";
import {
  resolveSidebarContentButtonState,
  resolveSidebarContentItemAriaDisabled,
  resolveSidebarContentItemTabIndex,
  shouldAllowSidebarContentItemActivation,
  shouldAllowSidebarContentItemPointerAction
} from "./resolveSidebarContentButtonState.js";

export function SidebarInternalGrid({
  content,
  selection = null,
  sidebarItem = null,
  itemElementMapRef = null,
  gridArea = null,
  onActivateItem,
  onOpenItemMenu,
  onSelectItem,
  onStartItemMove,
  onStartItemResize
}) {
  const resolvedContent = resolveSidebarInternalGridContent(
    content,
    gridArea ?? sidebarItem,
    sidebarItem?.meta?.sidebar?.content
  );
  const grid = resolvedContent?.grid;
  const items = Array.isArray(resolvedContent?.items) ? resolvedContent.items : [];
  const pendingActivationRef = useRef(null);
  const pointerPressRef = useRef(null);
  const [hoveredContentItemId, setHoveredContentItemId] = useState(null);
  const [pressedContentItemId, setPressedContentItemId] = useState(null);

  useEffect(() => () => {
    cancelPendingActivation(pendingActivationRef);
  }, []);

  if (!grid || items.length === 0) {
    return null;
  }

  return (
    <div
      className="grid-operation-sidebar-content"
      style={resolveSidebarInternalGridStyle(grid)}
      aria-label="Sidebar content"
    >
      {items.map((item) => {
        const selected = isSelectedSidebarContentItem(selection, {
          sidebarItem,
          contentItem: item
        });
        const baseButtonState = resolveSidebarContentButtonState({
          contentItem: item,
          selected
        });
        const allowsPointerState = shouldAllowSidebarContentItemPointerAction(baseButtonState);
        const hovered = allowsPointerState && hoveredContentItemId === item.id;
        const pressed = allowsPointerState && pressedContentItemId === item.id;
        const buttonState = hovered || pressed
          ? resolveSidebarContentButtonState({
            contentItem: item,
            selected,
            hovered,
            pressed
          })
          : baseButtonState;
        const menuTarget = createSidebarContentOperationMenuTarget({
          sidebarItemId: sidebarItem?.id,
          contentItemId: item.id
        });
        const anchorKey = getOperationMenuTargetAnchorKey(menuTarget);

        return (
          <div
            aria-disabled={resolveSidebarContentItemAriaDisabled(buttonState)}
            aria-pressed={selected}
            className={getSidebarContentItemClassName(item, { selected, buttonState })}
            key={item.id}
            ref={(element) => {
              if (!itemElementMapRef?.current || !anchorKey) {
                return;
              }

              if (element) {
                itemElementMapRef.current.set(anchorKey, element);
                return;
              }

              itemElementMapRef.current.delete(anchorKey);
            }}
            role="button"
            tabIndex={resolveSidebarContentItemTabIndex(buttonState, selected)}
            style={{
              gridColumn: `${item.x} / span ${item.w}`,
              gridRow: `${item.y} / span ${item.h}`,
              backgroundColor: resolveSidebarBackgroundColor(item.style),
              borderColor: item.style?.borderColor,
              borderWidth: item.style?.borderWidth === undefined
                ? undefined
                : `${item.style.borderWidth}px`,
              color: item.style?.textColor,
              fontFamily: resolveSidebarContentFontFamily(item.style?.fontFamily),
              fontSize: `${item.style?.fontSize ?? 14}px`,
              fontWeight: item.style?.fontWeight ?? 600,
              justifyContent: resolveSidebarContentJustify(item.style?.align),
              lineHeight: item.style?.lineHeight ?? SIDEBAR_DEFAULT_LINE_HEIGHT,
              textAlign: item.style?.align ?? "center"
            }}
            title={item.text}
            onPointerEnter={() => {
              if (!shouldAllowSidebarContentItemPointerAction(buttonState)) {
                return;
              }

              setHoveredContentItemId(item.id);
            }}
            onPointerLeave={() => {
              setHoveredContentItemId((currentItemId) => (
                currentItemId === item.id ? null : currentItemId
              ));
              setPressedContentItemId((currentItemId) => (
                currentItemId === item.id ? null : currentItemId
              ));
            }}
            onPointerDown={(event) => {
              if (!shouldAllowSidebarContentItemPointerAction(buttonState)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }

              setPressedContentItemId(item.id);

              const handled = handleSidebarContentPointerBoundary({
                event,
                sidebarItem,
                contentItem: item,
                onSelectItem
              });

              if (!handled) {
                setPressedContentItemId((currentItemId) => (
                  currentItemId === item.id ? null : currentItemId
                ));
                return;
              }

              pointerPressRef.current = {
                pointerId: event.pointerId,
                clientX: event.clientX,
                clientY: event.clientY
              };
              onStartItemMove?.(event, sidebarItem, item, resolvedContent);
            }}
            onPointerUp={() => {
              setPressedContentItemId((currentItemId) => (
                currentItemId === item.id ? null : currentItemId
              ));
            }}
            onPointerCancel={() => {
              setPressedContentItemId((currentItemId) => (
                currentItemId === item.id ? null : currentItemId
              ));
            }}
            onClick={(event) => {
              stopSidebarContentBoundaryEvent(event);

              if (!shouldAllowSidebarContentItemActivation(buttonState)) {
                pointerPressRef.current = null;
                return;
              }

              if (shouldSuppressSidebarContentActivation(event, pointerPressRef)) {
                return;
              }

              scheduleSidebarContentActivation({
                pendingActivationRef,
                sidebarItem,
                contentItem: item,
                onActivateItem
              });
            }}
            onDoubleClick={(event) => {
              stopSidebarContentBoundaryEvent(event);
              cancelPendingActivation(pendingActivationRef);

              if (!shouldAllowSidebarContentItemActivation(buttonState)) {
                pointerPressRef.current = null;
                return;
              }

              onOpenItemMenu?.(event, sidebarItem, item);
            }}
            onKeyDown={(event) => {
              if (!shouldAllowSidebarContentItemActivation(buttonState)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }

              const handled = handleSidebarContentKeyboardBoundary({
                event,
                sidebarItem,
                contentItem: item,
                onSelectItem
              });

              if (handled) {
                onActivateItem?.({
                  sidebarItem,
                  contentItem: item,
                  activation: "keyboard"
                });
              }
            }}
          >
            <div
              className="grid-operation-sidebar-content-item-text"
              style={{
                opacity: item.style?.textOpacity
              }}
            >
              {item.text}
            </div>
            {selected && shouldAllowSidebarContentItemPointerAction(buttonState) && (
              <ResizeHandles
                item={item}
                onPointerDown={(event, currentItem, handle) => {
                  onStartItemResize?.(event, sidebarItem, currentItem, resolvedContent, handle);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SIDEBAR_CONTENT_CLICK_ACTIVATION_DELAY_MS = 240;
const SIDEBAR_CONTENT_DRAG_CLICK_TOLERANCE_PX = 3;
const SIDEBAR_DEFAULT_BACKGROUND_COLOR = "#ecfdf5";
const SIDEBAR_DEFAULT_LINE_HEIGHT = 1.2;
const SIDEBAR_CONTENT_FONT_FAMILY_CSS = {
  [SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM]: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  [SIDEBAR_CONTENT_FONT_FAMILIES.SERIF]: "Georgia, serif",
  [SIDEBAR_CONTENT_FONT_FAMILIES.MONO]: "ui-monospace, SFMono-Regular, Menlo, monospace",
  [SIDEBAR_CONTENT_FONT_FAMILIES.DISPLAY]: "Inter, ui-sans-serif, system-ui, sans-serif"
};

function scheduleSidebarContentActivation({
  pendingActivationRef,
  sidebarItem,
  contentItem,
  onActivateItem
}) {
  cancelPendingActivation(pendingActivationRef);

  pendingActivationRef.current = window.setTimeout(() => {
    pendingActivationRef.current = null;
    onActivateItem?.({
      sidebarItem,
      contentItem,
      activation: "pointer"
    });
  }, SIDEBAR_CONTENT_CLICK_ACTIVATION_DELAY_MS);
}

function cancelPendingActivation(pendingActivationRef) {
  if (!pendingActivationRef.current) {
    return;
  }

  window.clearTimeout(pendingActivationRef.current);
  pendingActivationRef.current = null;
}

function shouldSuppressSidebarContentActivation(event, pointerPressRef) {
  const pointerPress = pointerPressRef.current;

  pointerPressRef.current = null;

  if (!pointerPress) {
    return false;
  }

  return (
    Math.abs(Number(event.clientX) - pointerPress.clientX) > SIDEBAR_CONTENT_DRAG_CLICK_TOLERANCE_PX ||
    Math.abs(Number(event.clientY) - pointerPress.clientY) > SIDEBAR_CONTENT_DRAG_CLICK_TOLERANCE_PX
  );
}

function resolveSidebarContentJustify(align) {
  if (align === SIDEBAR_CONTENT_TEXT_ALIGNS.LEFT) {
    return "flex-start";
  }

  if (align === SIDEBAR_CONTENT_TEXT_ALIGNS.RIGHT) {
    return "flex-end";
  }

  return "center";
}

function resolveSidebarBackgroundColor(style) {
  if (!style?.backgroundOpacity) {
    return style?.backgroundColor;
  }

  return resolveHexColorWithOpacity(
    style.backgroundColor ?? SIDEBAR_DEFAULT_BACKGROUND_COLOR,
    style.backgroundOpacity
  );
}

function resolveSidebarContentFontFamily(value) {
  return SIDEBAR_CONTENT_FONT_FAMILY_CSS[value] ?? SIDEBAR_CONTENT_FONT_FAMILY_CSS[SIDEBAR_CONTENT_FONT_FAMILIES.SYSTEM];
}

function resolveHexColorWithOpacity(color, opacity) {
  const text = String(color ?? "").trim();

  if (!/^#[0-9a-fA-F]{6}$/.test(text)) {
    return undefined;
  }

  const red = Number.parseInt(text.slice(1, 3), 16);
  const green = Number.parseInt(text.slice(3, 5), 16);
  const blue = Number.parseInt(text.slice(5, 7), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

