import { useEffect, useRef, useState } from "react";
import {
  MOBILE_SIDEBAR_CONTENT_RENDER_MODES,
  resolveMobileIconStripContent,
  resolveMobileIconStripItemAreaStyle,
  resolveMobileIconStripItemPresentation,
  resolveMobileIconStripSettingsChrome,
  resolveSidebarContentButtonState,
  resolveSidebarContentItemAriaDisabled,
  resolveSidebarContentItemTabIndex,
  shouldAllowSidebarContentItemActivation,
  shouldAllowSidebarContentItemMenuOpen,
  shouldAllowSidebarContentItemPointerAction
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
import { resolveMobileIconStripGridStyle } from "./resolveMobileIconStripGridStyle.js";

export function MobileSidebarIconStrip({
  content,
  sidebarItem,
  gridArea = null,
  selection,
  renderMode,
  itemElementMapRef,
  onActivateItem,
  onSelectItem,
  onSelectSidebarShell,
  onOpenSidebarMenu,
  onOpenContentItemMenu,
  onStartItemMove,
  onStartItemResize
}) {
  if (renderMode !== MOBILE_SIDEBAR_CONTENT_RENDER_MODES.ICON_STRIP_CONTENT) {
    return null;
  }

  const resolvedContent = resolveMobileIconStripContent(
    content,
    gridArea ?? sidebarItem,
    sidebarItem?.meta?.sidebar?.mobileLayout
  );
  const grid = resolvedContent?.grid;
  const items = Array.isArray(resolvedContent?.items) ? resolvedContent.items : [];
  const settingsChrome = resolveMobileIconStripSettingsChrome();

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
      className="grid-operation-mobile-sidebar-icon-strip is-content-grid"
      style={resolveMobileIconStripGridStyle(grid)}
      role="tablist"
      aria-label="Мобильная навигация"
      onPointerDown={stopSidebarContentBoundaryEvent}
      onClick={stopSidebarContentBoundaryEvent}
    >
      {items.map((contentItem) => {
        const itemState = resolveMobileIconStripItemPresentation({ contentItem });
        const selected = isSelectedSidebarContentItem(selection, {
          sidebarItem,
          contentItem
        });
        const baseButtonState = resolveSidebarContentButtonState({
          contentItem,
          selected
        });
        const allowsPointerState = shouldAllowSidebarContentItemPointerAction(baseButtonState);
        const hovered = allowsPointerState && hoveredContentItemId === contentItem.id;
        const pressed = allowsPointerState && pressedContentItemId === contentItem.id;
        const buttonState = hovered || pressed
          ? resolveSidebarContentButtonState({
            contentItem,
            selected,
            hovered,
            pressed
          })
          : baseButtonState;
        const menuTarget = createSidebarContentOperationMenuTarget({
          sidebarItemId: sidebarItem?.id,
          contentItemId: contentItem.id
        });
        const anchorKey = getOperationMenuTargetAnchorKey(menuTarget);

        return (
          <button
            key={itemState.id}
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
            type="button"
            className={[
              itemState.className,
              "is-grid-positioned",
              selected ? "is-selected" : ""
            ].filter(Boolean).join(" ")}
            style={resolveMobileIconStripItemAreaStyle(contentItem)}
            role="tab"
            tabIndex={resolveSidebarContentItemTabIndex(buttonState, selected)}
            title={itemState.text}
            aria-label={itemState.text}
            aria-selected={selected ? true : undefined}
            aria-disabled={resolveSidebarContentItemAriaDisabled(buttonState) ? true : undefined}
            disabled={itemState.disabled}
            onPointerEnter={() => {
              if (!allowsPointerState) {
                return;
              }

              setHoveredContentItemId(contentItem.id);
            }}
            onPointerLeave={() => {
              setHoveredContentItemId((currentItemId) => (
                currentItemId === contentItem.id ? null : currentItemId
              ));
              setPressedContentItemId((currentItemId) => (
                currentItemId === contentItem.id ? null : currentItemId
              ));
            }}
            onPointerDown={(event) => {
              if (!shouldAllowSidebarContentItemPointerAction(buttonState)) {
                event.stopPropagation();
                pointerPressRef.current = null;
                return;
              }

              setPressedContentItemId(contentItem.id);

              const handled = handleSidebarContentPointerBoundary({
                event,
                sidebarItem,
                contentItem,
                onSelectItem
              });

              if (!handled) {
                setPressedContentItemId((currentItemId) => (
                  currentItemId === contentItem.id ? null : currentItemId
                ));
                return;
              }

              pointerPressRef.current = {
                pointerId: event.pointerId,
                clientX: event.clientX,
                clientY: event.clientY
              };
              onStartItemMove?.(event, sidebarItem, contentItem, resolvedContent);
            }}
            onPointerUp={() => {
              setPressedContentItemId((currentItemId) => (
                currentItemId === contentItem.id ? null : currentItemId
              ));
            }}
            onPointerCancel={() => {
              setPressedContentItemId((currentItemId) => (
                currentItemId === contentItem.id ? null : currentItemId
              ));
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
                contentItem,
                onSelectItem
              });

              if (handled) {
                onActivateItem?.({
                  event,
                  sidebarItem,
                  contentItem,
                  activation: "icon-strip"
                });
              }
            }}
            onDoubleClick={(event) => {
              stopSidebarContentBoundaryEvent(event);
              cancelPendingActivation(pendingActivationRef);

              if (!shouldAllowSidebarContentItemMenuOpen(buttonState)) {
                pointerPressRef.current = null;
                return;
              }

              onOpenContentItemMenu?.(event, sidebarItem, contentItem);
            }}
            onClick={(event) => {
              if (!shouldAllowSidebarContentItemActivation(buttonState)) {
                event.stopPropagation();
                pointerPressRef.current = null;
                return;
              }

              stopSidebarContentBoundaryEvent(event);

              if (shouldSuppressSidebarContentActivation(event, pointerPressRef)) {
                return;
              }

              scheduleSidebarContentActivation({
                pendingActivationRef,
                sidebarItem,
                contentItem,
                onActivateItem,
                activation: "icon-strip"
              });
            }}
          >
            <span className="grid-operation-mobile-sidebar-icon-strip-glyph" aria-hidden="true">
              {itemState.glyph}
            </span>
            {selected && shouldAllowSidebarContentItemPointerAction(buttonState) && (
              <ResizeHandles
                item={contentItem}
                onPointerDown={(event, currentItem, handle) => {
                  onStartItemResize?.(event, sidebarItem, currentItem, resolvedContent, handle);
                }}
              />
            )}
          </button>
        );
      })}
      <button
        type="button"
        className={[settingsChrome.className, "is-overlay-chrome"].filter(Boolean).join(" ")}
        title={settingsChrome.label}
        aria-label={settingsChrome.label}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSelectSidebarShell?.(event, sidebarItem);
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenSidebarMenu?.(event, sidebarItem);
        }}
      >
        <span className="grid-operation-mobile-sidebar-icon-strip-glyph" aria-hidden="true">
          {settingsChrome.glyph}
        </span>
      </button>
    </div>
  );
}

const SIDEBAR_CONTENT_CLICK_ACTIVATION_DELAY_MS = 240;
const SIDEBAR_CONTENT_DRAG_CLICK_TOLERANCE_PX = 3;

function scheduleSidebarContentActivation({
  pendingActivationRef,
  sidebarItem,
  contentItem,
  onActivateItem,
  activation
}) {
  cancelPendingActivation(pendingActivationRef);

  pendingActivationRef.current = window.setTimeout(() => {
    pendingActivationRef.current = null;
    onActivateItem?.({
      sidebarItem,
      contentItem,
      activation
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
