import { ResizeHandles } from "./ResizeHandles.jsx";

export function OperationItemControls({ item, renderInfo, onStartResize }) {
  if (!item) {
    return null;
  }

  const renderArea = renderInfo?.renderArea ?? item;

  if (!renderArea) {
    return null;
  }

  return (
    <div
      className="grid-operation-controls-layer"
      aria-label="Operation controls layer"
    >
      <div
        className="grid-operation-selection-controls"
        style={{
          gridColumn: `${renderArea.x} / span ${renderArea.w}`,
          gridRow: `${renderArea.y} / span ${renderArea.h}`
        }}
      >
        {(!renderInfo?.areaMode || renderInfo.areaMode === "expanded") && (
          <ResizeHandles item={item} onPointerDown={onStartResize} />
        )}
      </div>
    </div>
  );
}
