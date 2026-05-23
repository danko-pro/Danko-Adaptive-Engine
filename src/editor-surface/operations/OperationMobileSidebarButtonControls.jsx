import { ResizeHandles } from "./ResizeHandles.jsx";
import { isSelectedMobileSidebarButton } from "./operationInternalSelection.js";

export function OperationMobileSidebarButtonControls({
  selection,
  itemRenderInfoById,
  sourceItemById,
  onStartResize
}) {
  if (!selection?.sidebarItemId) {
    return null;
  }

  const sidebarItem = sourceItemById?.get(String(selection.sidebarItemId));
  const renderInfo = itemRenderInfoById?.get(String(selection.sidebarItemId));
  const buttonArea = renderInfo?.mobilePresentation?.buttonArea;

  if (
    !sidebarItem ||
    !isSelectedMobileSidebarButton(selection, { sidebarItem }) ||
    renderInfo?.mobilePresentation?.mode !== "compact-menu-button" ||
    !buttonArea
  ) {
    return null;
  }

  return (
    <div
      className="grid-operation-controls-layer"
      aria-label="Mobile sidebar button controls layer"
    >
      <div
        className="grid-operation-selection-controls is-mobile-sidebar-button"
        style={{
          gridColumn: `${buttonArea.x} / span ${buttonArea.w}`,
          gridRow: `${buttonArea.y} / span ${buttonArea.h}`
        }}
      >
        <ResizeHandles
          item={sidebarItem}
          onPointerDown={(event, item, handle) => onStartResize?.(event, item, renderInfo, handle)}
        />
      </div>
    </div>
  );
}
