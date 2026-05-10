import { processLayoutItems } from "../../../adaptive-engine/core/index.js";

const debugAreaItems = [
  {
    id: "debug-area-probe",
    x: 2,
    y: 2,
    w: 6,
    h: 4
  }
];

// Временная проверка полного area/layout pipeline на реальной сетке.
// Перед production-режимом удалить или заменить настоящим debug-инструментом.
export function GridDebugAreaProbe({ metrics }) {
  const layoutResult = processLayoutItems(debugAreaItems, metrics);

  if (!layoutResult.valid) {
    return null;
  }

  return (
    <>
      {layoutResult.items.map((item) => (
        <div
          className="grid-debug-area-probe"
          key={item.id}
          style={{
            gridColumn: `${item.x} / span ${item.w}`,
            gridRow: `${item.y} / span ${item.h}`
          }}
          title={`${item.id}: ${item.rect.width}px x ${item.rect.height}px`}
        >
          <span>area</span>
        </div>
      ))}
    </>
  );
}
