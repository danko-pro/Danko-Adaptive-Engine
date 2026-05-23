import {
  resolveSidebarLayoutOccupancy,
  resolveSidebarViewportModeFromMetrics,
  shouldPreserveSidebarSourceGeometry
} from "../../sidebar-element/index.js";

export function resolveSceneLayoutOccupancyItems(items = [], metrics = null) {
  const sourceItems = Array.isArray(items) ? items : [];
  const viewportMode = resolveSidebarViewportModeFromMetrics(metrics);

  return sourceItems.map((item) => {
    const occupancy = resolveSidebarLayoutOccupancy(item, { viewportMode, metrics });

    if (!occupancy) {
      return item;
    }

    return {
      ...item,
      ...occupancy
    };
  });
}

export function restoreSidebarSourceAreas({ sourceItems = [], nextItems = [], metrics = null } = {}) {
  const sourceById = new Map(sourceItems.map((item) => [String(item.id), item]));
  const viewportMode = resolveSidebarViewportModeFromMetrics(metrics);

  return nextItems.map((item) => {
    const source = sourceById.get(String(item.id));

    if (!source || !shouldPreserveSidebarSourceGeometry(source, { viewportMode, metrics })) {
      return item;
    }

    return {
      ...item,
      x: source.x,
      y: source.y,
      w: source.w,
      h: source.h
    };
  });
}

export function resolveItemsForLayoutValidation(fittedItems = [], sourceItems = [], metrics = null) {
  const sourceById = new Map(sourceItems.map((item) => [String(item.id), item]));
  const viewportMode = resolveSidebarViewportModeFromMetrics(metrics);

  return fittedItems.map((item) => {
    const source = sourceById.get(String(item.id));

    if (!source || !shouldPreserveSidebarSourceGeometry(source, { viewportMode, metrics })) {
      return item;
    }

    const [occupancyItem] = resolveSceneLayoutOccupancyItems([source], metrics);

    return {
      ...item,
      x: occupancyItem.x,
      y: occupancyItem.y,
      w: occupancyItem.w,
      h: occupancyItem.h
    };
  });
}
