export const COMPOSITION_DEVICE_PROFILES = {
  DESKTOP: "desktop",
  TABLET: "tablet",
  MOBILE: "mobile"
};

export function resolveCompositionDeviceProfile(metrics) {
  const columns = Math.max(1, Number(metrics?.columns) || 1);

  if (columns >= 56) {
    return COMPOSITION_DEVICE_PROFILES.DESKTOP;
  }

  if (columns >= 32) {
    return COMPOSITION_DEVICE_PROFILES.TABLET;
  }

  return COMPOSITION_DEVICE_PROFILES.MOBILE;
}
