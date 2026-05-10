import { resolveSelection } from "../../adaptive-engine/core/index.js";

export function resolveAdapterSelection({ cell, items, metrics }) {
  if (!cell) {
    return null;
  }

  return resolveSelection({ cell, items, metrics });
}
