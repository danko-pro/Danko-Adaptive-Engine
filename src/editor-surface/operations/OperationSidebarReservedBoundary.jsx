import { resolveOperationSidebarReservedBoundary } from "../../../sidebar-element/index.js";

export function OperationSidebarReservedBoundary({ enabled = true, items, metrics }) {
  if (!enabled) {
    return null;
  }

  const boundaryInfo = resolveOperationSidebarReservedBoundary({ items, metrics });
  const boundaries = boundaryInfo.boundaries;

  return (
    <div className="grid-operation-sidebar-boundary-layer" aria-label="Границы fixed-сайдбара">
      {boundaries.map((boundary) => (
        <div
          className={`grid-operation-sidebar-boundary is-${boundary.orientation} is-${boundary.id}`}
          key={boundary.id}
          style={boundary.style}
        />
      ))}
    </div>
  );
}
