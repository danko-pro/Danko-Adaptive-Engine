export const BLOCK_CONTENT_TYPES = {
  UNKNOWN: "unknown",
  HEADER: "header",
  CONTENT: "content",
  SIDEBAR: "sidebar",
  CONTROL: "control",
  WARNING: "warning"
};

export function resolveBlockContentType(value) {
  const normalized = String(value ?? "").trim();
  const knownTypes = Object.values(BLOCK_CONTENT_TYPES);

  return knownTypes.includes(normalized) ? normalized : BLOCK_CONTENT_TYPES.UNKNOWN;
}
