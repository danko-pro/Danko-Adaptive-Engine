import { useState } from "react";
import { formatGridDebugMetrics } from "./gridDebugFormat.js";

export function GridDebugOverlay({ metrics }) {
  const [expanded, setExpanded] = useState(false);
  const rows = formatGridDebugMetrics(metrics);

  if (!expanded) {
    return (
      <button
        className="grid-debug-overlay-toggle"
        type="button"
        onClick={() => setExpanded(true)}
      >
        metrics
      </button>
    );
  }

  return (
    <aside className="grid-debug-overlay" aria-label="Grid debug metrics">
      <header>
        <strong>metrics</strong>
        <button type="button" onClick={() => setExpanded(false)}>
          hide
        </button>
      </header>
      <div className="grid-debug-row-list">
        {rows.map(([label, caption, value]) => (
          <div className="grid-debug-row" key={label}>
            <span>
              {label}
              <small>{caption}</small>
            </span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}
