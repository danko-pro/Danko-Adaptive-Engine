import { createAdapterLayoutMap } from "../../../engine-adapter/index.js";

export function GridLayoutMapOverlay({ items, metrics }) {
  const command = createAdapterLayoutMap({ items, metrics });

  if (!command.ok) {
    return null;
  }

  const map = command.data.map;

  return (
    <div className="grid-layout-map-overlay" aria-label="Карта отступов блоков">
      {map.items.map((item) => {
        const anchors = formatAnchors(item.anchors);

        return (
          <div
            className="grid-layout-map-card"
            key={item.id}
            style={{
              gridColumn: `${item.x} / span ${item.w}`,
              gridRow: `${item.y} / span ${item.h}`
            }}
          >
            <span>L {item.edges.left}</span>
            <span>R {item.edges.right}</span>
            <span>T {item.edges.top}</span>
            <span>B {item.edges.bottom}</span>
            {anchors && <strong>{anchors}</strong>}
          </div>
        );
      })}
    </div>
  );
}

function formatAnchors(anchors) {
  const activeAnchors = [];

  if (anchors.left) activeAnchors.push("L");
  if (anchors.right) activeAnchors.push("R");
  if (anchors.top) activeAnchors.push("T");
  if (anchors.bottom) activeAnchors.push("B");

  return activeAnchors.length > 0 ? `зацеп: ${activeAnchors.join("+")}` : "";
}
