import { COMPOSITION_MODES, resolveCompositionMode } from "./contracts/compositionModes.js";

export function runtimeSnapshotToCompositionInput(snapshot = {}, options = {}) {
  const components = Array.isArray(snapshot.components) ? snapshot.components : [];
  const relationships = Array.isArray(snapshot.relationships) ? snapshot.relationships : [];
  const metrics = normalizeMetrics(snapshot.metrics, components);
  const layoutComponents = components.filter(shouldUseComponentAsLayoutItem);

  return {
    mode: resolveCompositionMode(options.mode ?? snapshot.behaviorMode ?? COMPOSITION_MODES.SUGGEST),
    metrics,
    sourceMetrics: metrics,
    workspaceId: snapshot.workspaceId ?? snapshot.id ?? null,
    activeRoute: snapshot.activeRoute ?? null,
    items: layoutComponents.map(componentToCompositionItem),
    contentSchemas: Object.fromEntries(
      layoutComponents.map((component) => [
        String(component.id),
        componentToContentSchema(component, metrics)
      ])
    ),
    dependencies: relationshipsToDependencies(relationships),
    relationships: normalizeRelationships(relationships)
  };
}

function shouldUseComponentAsLayoutItem(component) {
  return (
    component &&
    component.id !== undefined &&
    component.id !== null &&
    component.area &&
    component.layoutParticipation !== "none" &&
    component.capabilities?.parentOnly !== true
  );
}

function componentToCompositionItem(component) {
  return {
    id: String(component.id),
    type: component.type ?? "area",
    x: Number(component.area.x),
    y: Number(component.area.y),
    w: Number(component.area.w),
    h: Number(component.area.h),
    meta: {
      title: component.title ?? "",
      value: component.title ?? String(component.id),
      dataKey: component.dataKey ?? null,
      parentId: component.parentId ?? null,
      sourceType: component.type ?? "unknown",
      capabilities: component.capabilities ?? {},
      layoutParticipation: component.layoutParticipation ?? "always"
    }
  };
}

function componentToContentSchema(component, metrics) {
  return {
    type: mapWorkspaceTypeToCompositionType(component, metrics),
    sourceType: component.type ?? "unknown",
    title: component.title ?? "",
    dataKey: component.dataKey ?? null,
    parentId: component.parentId ?? null,
    capabilities: component.capabilities ?? {},
    layoutParticipation: component.layoutParticipation ?? "always"
  };
}

function mapWorkspaceTypeToCompositionType(component, metrics) {
  const type = String(component.type ?? "unknown").toLowerCase();

  if (type === "toolbar") {
    return Number(component.area?.y) <= 1 ? "header" : "control";
  }

  if (type === "stage" || type === "workspace" || type === "list" || type === "table" || type === "summary") {
    return "content";
  }

  if (type === "panel") {
    return isSidePanel(component, metrics) ? "sidebar" : "content";
  }

  if (type === "form" || type === "editor") {
    return "control";
  }

  if (type === "metric" || type === "navigation" || type === "popover") {
    return "control";
  }

  return type || "unknown";
}

function isSidePanel(component, metrics) {
  const columns = Math.max(1, Number(metrics.columns));
  const right = Number(component.area.x) + Number(component.area.w) - 1;

  return right >= Math.ceil(columns * 0.75) || Number(component.area.x) <= Math.ceil(columns * 0.25);
}

function relationshipsToDependencies(relationships) {
  const dependencies = {};

  for (const relationship of relationships) {
    if (!relationship?.sourceId || !relationship?.targetId) {
      continue;
    }

    const sourceId = String(relationship.sourceId);
    const targetId = String(relationship.targetId);

    dependencies[sourceId] = dependencies[sourceId] ?? [];

    if (!dependencies[sourceId].includes(targetId)) {
      dependencies[sourceId].push(targetId);
    }
  }

  return dependencies;
}

function normalizeRelationships(relationships) {
  return relationships
    .filter((relationship) => relationship?.sourceId && relationship?.targetId)
    .map((relationship) => ({
      sourceId: String(relationship.sourceId),
      targetId: String(relationship.targetId),
      type: String(relationship.type ?? "depends-on"),
      note: relationship.note ?? null
    }));
}

function normalizeMetrics(metrics, components) {
  if (isValidMetrics(metrics)) {
    return {
      columns: Number(metrics.columns),
      rows: Number(metrics.rows)
    };
  }

  return inferMetricsFromComponents(components);
}

function inferMetricsFromComponents(components) {
  const areas = components.map((component) => component?.area).filter(Boolean);
  const columns = Math.max(1, ...areas.map((area) => Number(area.x) + Number(area.w) - 1));
  const rows = Math.max(1, ...areas.map((area) => Number(area.y) + Number(area.h) - 1));

  return {
    columns,
    rows
  };
}

function isValidMetrics(metrics) {
  return (
    metrics &&
    Number.isFinite(Number(metrics.columns)) &&
    Number.isFinite(Number(metrics.rows)) &&
    Number(metrics.columns) > 0 &&
    Number(metrics.rows) > 0
  );
}
