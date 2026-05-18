import { formatItemLabel } from "../../../engine-adapter/index.js";
import { SIDEBAR_STATES } from "../../../sidebar-element/index.js";
import { isSelectedItem } from "./operationProbeUtils.js";
import { OperationCompositionBadge } from "./OperationCompositionBadge.jsx";
import { SidebarInternalGrid } from "./SidebarInternalGrid.jsx";

export function OperationGridItem({
  item,
  operationItem = item,
  selection,
  compositionInfo,
  showCompositionOverlay,
  isMenuOpen,
  renderInfo,
  pageTransitionRole,
  pageTransition,
  itemElementMapRef,
  showSidebarReservedBoundary,
  onToggleSidebarReservedBoundary,
  onStartMove,
  onActivateSidebarContentItem,
  onOpenMenu,
  onOpenSidebarContentItemMenu,
  onSelectSidebarContentItem,
  onStartSidebarContentItemMove,
  onStartSidebarContentItemResize
}) {
  const renderArea = renderInfo?.renderArea ?? item;
  const showBoundaryToggle = isFixedSidebarItem({ item, renderInfo });
  const displayLabel = resolveItemDisplayLabel({ item, renderInfo });
  const showSidebarContent = shouldRenderSidebarContent(renderInfo);
  const boundaryToggleLabel = showSidebarReservedBoundary
    ? "Скрыть границу fixed-зоны"
    : "Показать границу fixed-зоны";

  return (
    <div
      ref={(element) => {
        if (element) {
          itemElementMapRef.current.set(String(item.id), element);
          return;
        }

        itemElementMapRef.current.delete(String(item.id));
      }}
      className={getItemClassName({
        item,
        selection,
        isMenuOpen,
        renderInfo,
        pageTransitionRole,
        pageTransition
      })}
      key={item.id}
      style={{
        gridColumn: `${renderArea.x} / span ${renderArea.w}`,
        gridRow: `${renderArea.y} / span ${renderArea.h}`,
        ...(pageTransitionRole ? {
          "--page-transition-duration": `${pageTransition.durationMs}ms`
        } : {})
      }}
      tabIndex={isSelectedItem(selection, item) ? 0 : -1}
      onPointerDown={(event) => {
        if (renderInfo?.areaMode && renderInfo.areaMode !== "expanded") {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        onStartMove(event, operationItem);
      }}
      onDoubleClick={(event) => onOpenMenu(event, operationItem)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && isSelectedItem(selection, item)) {
          onOpenMenu(event, operationItem);
        }
      }}
    >
      {showSidebarContent ? (
        <SidebarInternalGrid
          content={renderInfo.sidebar.content}
          gridArea={renderArea}
          selection={selection}
          sidebarItem={operationItem}
          itemElementMapRef={itemElementMapRef}
          onActivateItem={onActivateSidebarContentItem}
          onOpenItemMenu={onOpenSidebarContentItemMenu}
          onSelectItem={onSelectSidebarContentItem}
          onStartItemMove={onStartSidebarContentItemMove}
          onStartItemResize={onStartSidebarContentItemResize}
        />
      ) : (
        <span className="grid-operation-probe-label">{displayLabel}</span>
      )}
      {showBoundaryToggle && (
        <button
          className={[
            "grid-operation-sidebar-boundary-toggle",
            showSidebarReservedBoundary ? "is-active" : ""
          ].filter(Boolean).join(" ")}
          type="button"
          title={boundaryToggleLabel}
          aria-label={boundaryToggleLabel}
          aria-pressed={showSidebarReservedBoundary}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDoubleClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleSidebarReservedBoundary?.();
          }}
        >
          <span />
        </button>
      )}
      {showCompositionOverlay && compositionInfo && (
        <OperationCompositionBadge info={compositionInfo} />
      )}
    </div>
  );
}

function shouldRenderSidebarContent(renderInfo) {
  return (
    renderInfo?.areaMode === "expanded" &&
    Array.isArray(renderInfo?.sidebar?.content?.items) &&
    renderInfo.sidebar.content.items.length > 0
  );
}

function resolveItemDisplayLabel({ item, renderInfo }) {
  const sidebarLabel = resolveSidebarDisplayLabel(renderInfo);

  return sidebarLabel || formatItemLabel(item);
}

function resolveSidebarDisplayLabel(renderInfo) {
  if (renderInfo?.state !== SIDEBAR_STATES.FIXED) {
    return "";
  }

  const viewportLabel = SIDEBAR_VIEWPORT_LABELS[renderInfo?.viewportMode] || "экран ?";

  return `Фикс · ${viewportLabel}`;
}

function isFixedSidebarItem({ item, renderInfo }) {
  return (
    String(item?.meta?.blockType ?? "").trim() === "sidebar" &&
    renderInfo?.state === SIDEBAR_STATES.FIXED
  );
}

const SIDEBAR_VIEWPORT_LABELS = {
  default: "ПК",
  narrow: "узко",
  mobile: "моб"
};

function getItemClassName({
  item,
  selection,
  isMenuOpen,
  renderInfo,
  pageTransitionRole,
  pageTransition
}) {
  const classes = [
    "grid-operation-probe-item",
    `is-block-type-${normalizeBlockType(item.meta?.blockType)}`,
    `is-layer-${normalizeRenderValue(renderInfo?.layer)}`,
    `is-render-${normalizeRenderValue(renderInfo?.renderMode)}`,
    `is-area-${normalizeRenderValue(renderInfo?.areaMode)}`,
    `is-viewport-${normalizeRenderValue(renderInfo?.viewportMode)}`
  ];

  if (renderInfo?.state) {
    classes.push(`is-sidebar-state-${normalizeRenderValue(renderInfo.state)}`);
  }

  if (renderInfo?.trigger) {
    classes.push(`is-trigger-${normalizeRenderValue(renderInfo.trigger)}`);
  }

  if (renderInfo?.animation) {
    classes.push(`is-animation-${normalizeRenderValue(renderInfo.animation)}`);
  }

  if (isSelectedItem(selection, item)) {
    classes.push("is-selected");
  }

  if (isMenuOpen) {
    classes.push("is-menu-open");
  }

  if (pageTransitionRole) {
    classes.push(`is-page-transition-${normalizeRenderValue(pageTransitionRole)}`);
    classes.push(`is-page-transition-direction-${normalizeRenderValue(pageTransition?.direction)}`);
  }

  return classes.join(" ");
}

function normalizeBlockType(value) {
  return String(value || "unknown").trim() || "unknown";
}

function normalizeRenderValue(value) {
  return String(value || "default").trim() || "default";
}
