export const COMPOSITION_MODES = {
  OFF: "off",
  SUGGEST: "suggest",
  AUTO: "auto"
};

const KNOWN_MODES = new Set(Object.values(COMPOSITION_MODES));

export function resolveCompositionMode(mode = COMPOSITION_MODES.SUGGEST) {
  if (KNOWN_MODES.has(mode)) {
    return mode;
  }

  return COMPOSITION_MODES.SUGGEST;
}
