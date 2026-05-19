import {
  resolveMobileSidebarMenuItemState,
  resolveMobileSidebarMenuPanelState
} from "./mobileSidebarMenuPanelState.js";

export function MobileSidebarMenuPanel({
  sidebarItem,
  renderInfo,
  open = false,
  onActivateItem,
  onClose
}) {
  const panelState = resolveMobileSidebarMenuPanelState({ open, renderInfo });

  if (!panelState.visible) {
    return null;
  }

  return (
    <div
      className="grid-operation-mobile-sidebar-menu-panel"
      role="menu"
      aria-label="Мобильное меню"
      style={resolvePanelStyle(renderInfo?.renderArea)}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {panelState.items.map((contentItem) => {
        const itemState = resolveMobileSidebarMenuItemState({ contentItem });

        return (
          <button
            key={itemState.id}
            type="button"
            className={itemState.className}
            role="menuitem"
            aria-disabled={itemState.disabled ? true : undefined}
            disabled={itemState.disabled}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              if (!itemState.activatable) {
                return;
              }

              onActivateItem?.({
                sidebarItem,
                contentItem,
                activation: "mobile-menu"
              });
              onClose?.();
            }}
          >
            {itemState.text}
          </button>
        );
      })}
    </div>
  );
}

function resolvePanelStyle(renderArea) {
  const area = normalizeArea(renderArea);
  const minWidth = Math.max(area.w, 4);

  return {
    left: `calc(${area.x - 1} * var(--cell-size))`,
    top: `calc(${area.y + area.h - 1} * var(--cell-size) + 6px)`,
    minWidth: `calc(${minWidth} * var(--cell-size))`
  };
}

function normalizeArea(value) {
  return {
    x: normalizeGridNumber(value?.x, 1),
    y: normalizeGridNumber(value?.y, 1),
    w: normalizeGridSize(value?.w, 4),
    h: normalizeGridSize(value?.h, 1)
  };
}

function normalizeGridNumber(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) ? Math.max(1, Math.round(number)) : fallback;
}

function normalizeGridSize(value, fallback) {
  return Math.max(1, normalizeGridNumber(value, fallback));
}
