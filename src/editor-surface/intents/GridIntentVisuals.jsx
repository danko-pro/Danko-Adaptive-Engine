import {
  formatIntentStatusMessage,
  getIntentStatusClassName,
  getSelectedCellClassName
} from "./gridIntentUtils.js";

export function GridIntentHoverCell({ cell }) {
  if (!cell) {
    return null;
  }

  return (
    <div
      className="grid-intent-hover-cell"
      style={{
        gridColumn: `${cell.x} / span 1`,
        gridRow: `${cell.y} / span 1`
      }}
    />
  );
}

export function GridIntentAreaDraft({ area }) {
  if (!area) {
    return null;
  }

  return (
    <div
      className="grid-intent-area-draft"
      style={{
        gridColumn: `${area.x} / span ${area.w}`,
        gridRow: `${area.y} / span ${area.h}`
      }}
    >
      <span>{area.w}x{area.h}</span>
    </div>
  );
}

export function GridIntentSelectedCell({ cell, status }) {
  if (!cell) {
    return null;
  }

  return (
    <div
      className={getSelectedCellClassName(status)}
      style={{
        gridColumn: `${cell.x} / span 1`,
        gridRow: `${cell.y} / span 1`
      }}
    />
  );
}

export function GridIntentStatus({ status, selection }) {
  if (!status) {
    return null;
  }

  return (
    <output className={getIntentStatusClassName(status)}>
      {formatIntentStatusMessage(status, selection)}
    </output>
  );
}
