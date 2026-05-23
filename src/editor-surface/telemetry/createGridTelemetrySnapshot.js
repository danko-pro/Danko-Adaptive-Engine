import { formatItemLabel } from "../../../engine-adapter/index.js";

export function createGridTelemetrySnapshot({ metrics, items, selection }) {
  return {
    time: new Date().toLocaleTimeString("ru-RU", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    metrics: {
      mode: metrics.debug?.mode,
      horizontal: metrics.debug?.horizontalMode,
      vertical: metrics.debug?.verticalMode,
      columns: metrics.columns,
      rows: metrics.rows,
      cellSize: metrics.cellSize,
      gridWidth: metrics.gridWidth,
      gridHeight: metrics.gridHeight,
      workspaceWidth: metrics.workspaceWidth,
      workspaceHeight: metrics.workspaceHeight
    },
    items: items.map((item) => ({
      id: item.id,
      label: formatItemLabel(item),
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h
    })),
    selection: selection
      ? {
          type: selection.type,
          itemId: selection.itemId ?? null,
          cell: selection.cell ?? null
        }
      : null
  };
}

export function createGridTelemetryDiff(previous, current) {
  if (!previous) {
    return {
      changes: ["initial"],
      delta: {}
    };
  }

  const changes = [];
  const delta = {};

  collectMetricChanges(changes, delta, previous.metrics, current.metrics);

  if (JSON.stringify(previous.items) !== JSON.stringify(current.items)) {
    changes.push("items");
    delta.items = {
      previous: previous.items.length,
      current: current.items.length,
      value: current.items.length - previous.items.length
    };
  }

  if (JSON.stringify(previous.selection) !== JSON.stringify(current.selection)) {
    changes.push("selection");
    delta.selection = {
      previous: previous.selection,
      current: current.selection
    };
  }

  return {
    changes: changes.length > 0 ? changes : ["no-change"],
    delta
  };
}

function collectMetricChanges(changes, delta, previousMetrics, currentMetrics) {
  const watchedKeys = [
    "mode",
    "horizontal",
    "vertical",
    "columns",
    "rows",
    "cellSize",
    "gridWidth",
    "gridHeight",
    "workspaceWidth",
    "workspaceHeight"
  ];

  for (const key of watchedKeys) {
    if (previousMetrics[key] !== currentMetrics[key]) {
      changes.push(`metrics.${key}`);
      delta[`metrics.${key}`] = createDeltaValue(previousMetrics[key], currentMetrics[key]);
    }
  }
}

function createDeltaValue(previous, current) {
  if (typeof previous === "number" && typeof current === "number") {
    return {
      previous,
      current,
      value: roundDelta(current - previous)
    };
  }

  return {
    previous,
    current
  };
}

function roundDelta(value) {
  return Math.round(value * 1000) / 1000;
}
