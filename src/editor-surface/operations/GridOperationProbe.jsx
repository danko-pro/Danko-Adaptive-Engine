import { GridOperationProbeItems } from "./GridOperationProbeItems.jsx";
import { GridOperationProbePanel } from "./GridOperationProbePanel.jsx";
import { useGridOperationProbe } from "./useGridOperationProbe.js";

export { GridOperationProbeItems } from "./GridOperationProbeItems.jsx";
export { GridOperationProbePanel } from "./GridOperationProbePanel.jsx";
export { initialOperationProbeItems } from "./operationProbeData.js";
export { useGridOperationProbe } from "./useGridOperationProbe.js";

export function GridOperationProbe(props) {
  const operationProbe = useGridOperationProbe(props);

  return (
    <>
      <GridOperationProbeItems {...operationProbe.itemProps} />
      <GridOperationProbePanel {...operationProbe.panelProps} />
    </>
  );
}
