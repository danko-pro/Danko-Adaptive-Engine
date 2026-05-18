export const APP_SURFACE_MODES = {
  DEBUG: "debug",
  PRODUCTION: "production"
};

export function resolveAppSurfaceMode(env = {}) {
  return env.DEV ? APP_SURFACE_MODES.DEBUG : APP_SURFACE_MODES.PRODUCTION;
}
