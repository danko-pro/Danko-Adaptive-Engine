export const ADAPTER_BEHAVIOR_MODES = {
  OFF: "off",
  SAFE: "safe",
  SUGGEST: "suggest",
  AUTO: "auto"
};

const KNOWN_MODES = new Set(Object.values(ADAPTER_BEHAVIOR_MODES));

export function resolveAdapterBehaviorMode(mode = ADAPTER_BEHAVIOR_MODES.OFF) {
  if (KNOWN_MODES.has(mode)) {
    return mode;
  }

  return ADAPTER_BEHAVIOR_MODES.OFF;
}

export function shouldUseAdapterSafetyProjection(options = {}) {
  return resolveAdapterBehaviorMode(options.behaviorMode) === ADAPTER_BEHAVIOR_MODES.SAFE;
}

export function shouldPassBehaviorToV2(options = {}) {
  const mode = resolveAdapterBehaviorMode(options.behaviorMode);

  return mode === ADAPTER_BEHAVIOR_MODES.SUGGEST || mode === ADAPTER_BEHAVIOR_MODES.AUTO;
}
