import {
  LAYOUT_RELATION_VIEWPORT_MODES,
  normalizeLayoutRelations,
  resolveLayoutRelationManualTarget
} from "../../../engine-adapter/index.js";

const DEFAULT_LABEL = "Вернуть авто-позицию";
const DEFAULT_TITLE = "Сбросить ручную позицию для текущего адаптивного режима";

export function resolveRelationResetActionState({ items = [], itemId, metrics } = {}) {
  const manualTarget = resolveLayoutRelationManualTarget({
    items,
    itemId,
    metrics
  });
  const hiddenState = {
    visible: false,
    enabled: false,
    parentId: null,
    childId: null,
    viewportMode: manualTarget.viewportMode,
    label: DEFAULT_LABEL,
    title: DEFAULT_TITLE
  };

  if (!manualTarget.shouldUseManualOverride) {
    return hiddenState;
  }

  const parentItem = items.find(
    (entry) => String(entry?.id ?? "").trim() === manualTarget.parentId
  );
  const relations = normalizeLayoutRelations(parentItem?.meta?.layoutRelations);
  const relation = relations.children.find((child) => child.id === manualTarget.childId);
  const manualArea = relation?.manualAreas?.[manualTarget.viewportMode];

  if (!manualArea) {
    return hiddenState;
  }

  return {
    visible: true,
    enabled: true,
    parentId: manualTarget.parentId,
    childId: manualTarget.childId,
    viewportMode: manualTarget.viewportMode,
    label: DEFAULT_LABEL,
    title: resolveResetTitle(manualTarget.viewportMode)
  };
}

function resolveResetTitle(viewportMode) {
  if (viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.MOBILE) {
    return "Сбросить позицию для mobile";
  }

  if (viewportMode === LAYOUT_RELATION_VIEWPORT_MODES.NARROW) {
    return "Сбросить позицию для narrow";
  }

  return DEFAULT_TITLE;
}
