import { useEffect, useState } from "react";
import { pickRandomCell } from "../../../engine-adapter/index.js";

export function GridDebugCellHighlight({ metrics }) {
  const [cell, setCell] = useState(() => pickRandomCell(metrics));

  useEffect(() => {
    setCell((currentCell) => {
      return pickRandomCell(metrics, currentCell);
    });
  }, [metrics.columns, metrics.rows]);

  return (
    <div
      className="grid-debug-cell-highlight"
      style={{
        gridColumn: `${cell.x} / span 1`,
        gridRow: `${cell.y} / span 1`
      }}
      title={`debug cell: x${cell.x} y${cell.y}`}
    />
  );
}
