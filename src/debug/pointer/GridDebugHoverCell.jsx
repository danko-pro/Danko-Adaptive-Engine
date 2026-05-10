import { useState } from "react";
import { resolveEventCell } from "../../../engine-adapter/index.js";

// Временная проверка определения ячейки под мышью.
// Перед production-режимом удалить или заменить настоящим debug-инструментом.
export function GridDebugHoverCell({ metrics }) {
  const [hoverCell, setHoverCell] = useState(null);

  function handleMouseMove(event) {
    const cell = resolveEventCell(event, metrics);

    if (!cell) {
      setHoverCell(null);
      return;
    }

    setHoverCell(cell);
  }

  function handleMouseLeave() {
    setHoverCell(null);
  }

  return (
    <div
      className="grid-debug-hover-layer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {hoverCell && (
        <div
          className="grid-debug-hover-cell"
          style={{
            gridColumn: `${hoverCell.x} / span 1`,
            gridRow: `${hoverCell.y} / span 1`
          }}
          title={`hover cell: x${hoverCell.x} y${hoverCell.y}`}
        />
      )}
    </div>
  );
}
