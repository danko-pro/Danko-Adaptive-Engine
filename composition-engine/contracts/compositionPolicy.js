export const DEFAULT_COMPOSITION_POLICY = {
  spacing: {
    minGap: 0,
    preferredGap: 1
  }
};

export function resolveCompositionPolicy(policy = {}) {
  const spacing = policy.spacing && typeof policy.spacing === "object"
    ? policy.spacing
    : {};

  return {
    spacing: {
      minGap: resolveNonNegativeInteger(spacing.minGap, DEFAULT_COMPOSITION_POLICY.spacing.minGap),
      preferredGap: resolveNonNegativeInteger(
        spacing.preferredGap,
        DEFAULT_COMPOSITION_POLICY.spacing.preferredGap
      )
    }
  };
}

function resolveNonNegativeInteger(value, fallback) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return Math.floor(number);
}
