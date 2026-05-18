import {
  COMPOSITION_BEHAVIOR_PROFILE_IDS,
  getCompositionBehaviorProfile,
  resolveCompositionBehaviorProfileId
} from "../../composition-engine/index.js";

export function resolveLayoutItemBehavior({
  item,
  metrics,
  sourceMetrics = metrics,
  contentSchemas = {}
}) {
  const profile = resolveItemBehaviorProfile(item, contentSchemas);

  return {
    profile,
    minSize: resolveItemMinimumSize(item, metrics, profile),
    priority: resolveProjectionPriority(item, sourceMetrics, profile)
  };
}

function resolveProjectionPriority(item, sourceMetrics, profile) {
  const sourceColumns = Number.isFinite(sourceMetrics?.columns) ? sourceMetrics.columns : 0;
  const sourceRows = Number.isFinite(sourceMetrics?.rows) ? sourceMetrics.rows : 0;
  const touchesLeft = item.x <= 1;
  const touchesTop = item.y <= 1;
  const touchesRight = sourceColumns > 0 && item.x + item.w - 1 >= sourceColumns;
  const touchesBottom = sourceRows > 0 && item.y + item.h - 1 >= sourceRows;
  const structuralProfiles = new Set([
    COMPOSITION_BEHAVIOR_PROFILE_IDS.HEADER,
    COMPOSITION_BEHAVIOR_PROFILE_IDS.SIDEBAR,
    COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_WIDTH,
    COMPOSITION_BEHAVIOR_PROFILE_IDS.FULL_HEIGHT,
    COMPOSITION_BEHAVIOR_PROFILE_IDS.EDGE_BOUND
  ]);

  if ((touchesLeft && touchesRight) || (touchesTop && touchesBottom)) {
    return 0;
  }

  if (structuralProfiles.has(profile.id)) {
    return 1;
  }

  if (touchesLeft || touchesTop || touchesRight || touchesBottom) {
    return 3;
  }

  return 2;
}

function resolveItemBehaviorProfile(item, contentSchemas) {
  const contentSchema = resolveItemContentSchema(item, contentSchemas);
  const profileId = resolveCompositionBehaviorProfileId({
    block: {
      ...item,
      contentSchema
    },
    contentSchema
  });

  return getCompositionBehaviorProfile(profileId);
}

function resolveItemContentSchema(item, contentSchemas) {
  const itemId = String(item?.id ?? "");
  const schema = contentSchemas?.[itemId] ?? contentSchemas?.[item?.id];

  if (schema) {
    return schema;
  }

  return {
    type: item?.meta?.blockType,
    value: item?.meta?.value ?? ""
  };
}

function resolveItemMinimumSize(item, metrics, profile) {
  const profileMinSize = profile.minSize ?? { w: 1, h: 1 };

  return {
    w: clampMinimumSize(profileMinSize.w, item.w, metrics.columns),
    h: clampMinimumSize(profileMinSize.h, item.h, metrics.rows)
  };
}

function clampMinimumSize(profileValue, itemValue, metricLimit) {
  const profileNumber = Number.isFinite(profileValue) ? profileValue : 1;
  const itemNumber = Number.isFinite(itemValue) ? itemValue : 1;
  const metricNumber = Number.isFinite(metricLimit) ? metricLimit : itemNumber;

  return Math.max(1, Math.min(profileNumber, itemNumber, metricNumber));
}
