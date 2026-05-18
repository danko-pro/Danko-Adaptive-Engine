import { useEffect, useRef, useState } from "react";
import {
  createAdaptiveGrid,
  getInitialAdaptiveGridMetrics
} from "../../adaptive-engine/core/index.js";
import { layoutRules } from "./layoutRules.js";

export function ProductionCanvas() {
  const workspaceRef = useRef(null);
  const [gridMetrics, setGridMetrics] = useState(() =>
    getInitialAdaptiveGridMetrics(layoutRules)
  );

  useEffect(() => {
    if (!workspaceRef.current) {
      return undefined;
    }

    return createAdaptiveGrid(workspaceRef.current, layoutRules, setGridMetrics);
  }, []);

  return (
    <div className="layout-stage">
      <section className="layout-workspace" ref={workspaceRef}>
        <div className="layout-canvas" style={gridMetrics.cssVariables} />
      </section>
    </div>
  );
}
