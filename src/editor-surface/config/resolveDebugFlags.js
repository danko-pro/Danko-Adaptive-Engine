export function resolveDebugFlags(env = {}, profiles = {}) {
  const { defaultDebugFlags = {}, devDebugFlags = {} } = profiles;

  return env.DEV ? devDebugFlags : defaultDebugFlags;
}
