import { resolvePointerCell } from "./resolvePointerCell.js";

export function resolveEventCell(event, metrics, element = event.currentTarget) {
  return resolvePointerCell({
    clientX: event.clientX,
    clientY: event.clientY,
    element,
    metrics
  });
}
