import { resolveSelection } from "../../adaptive-engine/core/index.js";
import { resolveSceneLayoutOccupancyItems } from "../scene/resolveSceneLayoutEngineInput.js";

export function resolveAdapterSelection({ cell, items, metrics }) {
  if (!cell) {
    return null;
  }

  return resolveSelection({
    cell,
    items: resolveSceneLayoutOccupancyItems(items, metrics),
    metrics
  });
}
