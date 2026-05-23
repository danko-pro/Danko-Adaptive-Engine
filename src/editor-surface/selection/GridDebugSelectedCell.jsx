import { useState } from "react";
import {
  formatItemLabel,
  resolveAdapterSelection,
  resolveEventCell,
  SELECTION_TYPES
} from "../../../engine-adapter/index.js";

// Временный слой проверки input layer: click -> grid cell coordinates -> engine selection.
// Перед production-режимом удалить или заменить настоящим UI.
export function GridDebugSelectedCell({ items, metrics }) {
  const [selection, setSelection] = useState(null);

  function handleClick(event) {
    const cell = resolveEventCell(event, metrics);

    if (!cell) {
      setSelection(null);
      return;
    }

    setSelection(resolveAdapterSelection({ cell, items, metrics }));
  }

  return (
    <div className="grid-debug-selected-layer" onClick={handleClick}>
      {selection?.cell && (
        <div
          className={getSelectionClassName(selection.type)}
          style={{
            gridColumn: `${selection.cell.x} / span 1`,
            gridRow: `${selection.cell.y} / span 1`
          }}
        >
          {formatSelectionLabel(selection) && <span>{formatSelectionLabel(selection)}</span>}
        </div>
      )}
    </div>
  );
}

function getSelectionClassName(type) {
  return type === SELECTION_TYPES.AREA
    ? "grid-debug-selected-cell is-area"
    : "grid-debug-selected-cell";
}

function formatSelectionLabel(selection) {
  if (selection.type === SELECTION_TYPES.AREA) {
    return formatItemLabel(selection.item);
  }

  return `${selection.cell.x}:${selection.cell.y}`;
}
