import { formatItemLabel } from "../../../engine-adapter/index.js";

export function OperationPageTransitionLayer({
  items = [],
  transition = null
}) {
  if (!transition?.active || items.length === 0) {
    return null;
  }

  const durationStyle = {
    "--page-transition-duration": `${transition.durationMs}ms`
  };

  return (
    <div
      className={[
        "grid-operation-page-transition-layer",
        `is-page-transition-${normalizeClassValue(transition.type)}`,
        `is-page-transition-direction-${normalizeClassValue(transition.direction)}`
      ].join(" ")}
      style={durationStyle}
      aria-hidden="true"
    >
      {items.map((item) => (
        <div
          className={[
            "grid-operation-probe-item",
            "grid-operation-page-transition-item",
            "is-page-transition-exit",
            `is-block-type-${normalizeClassValue(item.meta?.blockType)}`,
            `is-page-transition-direction-${normalizeClassValue(transition.direction)}`
          ].join(" ")}
          key={`${transition.id}:${item.id}`}
          style={{
            gridColumn: `${item.x} / span ${item.w}`,
            gridRow: `${item.y} / span ${item.h}`
          }}
        >
          <span className="grid-operation-probe-label">{formatItemLabel(item)}</span>
        </div>
      ))}
    </div>
  );
}

function normalizeClassValue(value) {
  return String(value || "default").trim().replaceAll(" ", "-") || "default";
}
