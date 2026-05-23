export function resolveSidebarNumberFieldCommit({
  draftValue,
  fallbackValue,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  transform = (value) => value
} = {}) {
  const draftText = String(draftValue ?? "").trim();

  if (!draftText) {
    return createInvalidCommit(fallbackValue);
  }

  const number = Number(draftText);

  if (!Number.isFinite(number)) {
    return createInvalidCommit(fallbackValue);
  }

  const clampedValue = Math.min(Math.max(number, min), max);

  return {
    valid: true,
    value: clampedValue,
    modelValue: transform(clampedValue),
    draftValue: formatSidebarNumberDraft(clampedValue)
  };
}

export function formatSidebarNumberDraft(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function createInvalidCommit(fallbackValue) {
  return {
    valid: false,
    value: fallbackValue,
    modelValue: fallbackValue,
    draftValue: formatSidebarNumberDraft(fallbackValue)
  };
}
