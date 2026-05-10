import {
  BLOCK_CONTENT_TYPES,
  formatAdapterErrors,
  formatOperationReportStatus,
  formatTargetLabel,
  OPERATION_TYPES
} from "../../../engine-adapter/index.js";
import { formatSelection } from "./operationProbeUtils.js";

export function GridOperationProbePanel({
  form,
  items,
  lastReport,
  metrics,
  selection,
  activeBlockType,
  onRunOperation,
  onResetProbe,
  onUpdateForm,
  onUpdateBlockType,
  layoutMapStatus,
  onCaptureLayoutMap,
  showLayoutMapOverlay,
  onToggleLayoutMapOverlay,
  compositionPlan,
  compositionStatus,
  showCompositionOverlay,
  onInspectComposition,
  onApplyCompositionFix
}) {
  return (
    <div
      className="grid-operation-probe-panel"
      aria-label="Пульт проверки операций"
      style={{ width: `min(100%, ${Math.round(metrics.gridWidth)}px)` }}
    >
      <label>
        операция
        <select value={form.type} onChange={(event) => onUpdateForm("type", event.target.value)}>
          {Object.values(OPERATION_TYPES).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        тип
        <select value={activeBlockType} onChange={(event) => onUpdateBlockType(event.target.value)}>
          <option value={BLOCK_CONTENT_TYPES.UNKNOWN}>unknown</option>
          <option value={BLOCK_CONTENT_TYPES.HEADER}>header</option>
          <option value={BLOCK_CONTENT_TYPES.CONTENT}>content</option>
          <option value={BLOCK_CONTENT_TYPES.SIDEBAR}>sidebar</option>
          <option value={BLOCK_CONTENT_TYPES.CONTROL}>control</option>
          <option value={BLOCK_CONTENT_TYPES.WARNING}>warning</option>
        </select>
      </label>
      <label>
        цель
        <input readOnly title={form.targetId} value={formatTargetLabel(items, form.targetId)} />
      </label>
      <label>
        x
        <input
          min="1"
          type="number"
          value={form.x}
          onChange={(event) => onUpdateForm("x", event.target.value)}
        />
      </label>
      <label>
        y
        <input
          min="1"
          type="number"
          value={form.y}
          onChange={(event) => onUpdateForm("y", event.target.value)}
        />
      </label>
      <label>
        w
        <input
          min="1"
          type="number"
          value={form.w}
          onChange={(event) => onUpdateForm("w", event.target.value)}
        />
      </label>
      <label>
        h
        <input
          min="1"
          type="number"
          value={form.h}
          onChange={(event) => onUpdateForm("h", event.target.value)}
        />
      </label>
      <button type="button" onClick={onRunOperation}>
        apply
      </button>
      <button type="button" onClick={onResetProbe}>
        reset
      </button>
      <button type="button" onClick={onCaptureLayoutMap}>
        map save
      </button>
      <button
        className={showLayoutMapOverlay ? "is-active" : ""}
        type="button"
        onClick={onToggleLayoutMapOverlay}
      >
        map info
      </button>
      <button
        className={showCompositionOverlay ? "is-active" : ""}
        type="button"
        onClick={onInspectComposition}
      >
        v2 info
      </button>
      <button type="button" onClick={onApplyCompositionFix}>
        v2 fix
      </button>
      <div className="grid-operation-probe-selection">{formatSelection(selection)}</div>
      <output className={lastReport?.valid === false ? "is-error" : ""}>
        <span>{formatOperationReportStatus(lastReport)}</span>
        {lastReport && (
          <small aria-label="Технический отчет">
            {lastReport.type} | valid: {String(lastReport.valid)} | changed:{" "}
            {String(lastReport.changed)} | errors: {formatAdapterErrors(lastReport.errorsByType)}
          </small>
        )}
        {layoutMapStatus && <small>{layoutMapStatus}</small>}
        {compositionStatus && <small>{compositionStatus}</small>}
      </output>
      {compositionPlan && (
        <div className="grid-composition-report" aria-label="Отчет composition-engine">
          <strong>
            V2: {compositionPlan.status} / {compositionPlan.mode}
          </strong>
          <span>блоки: {compositionPlan.summary.blocks}</span>
          <span>группы: {compositionPlan.summary.groups}</span>
          <span>связи: {compositionPlan.summary.relations}</span>
          <span>сигналы: {compositionPlan.summary.issues}</span>
          <span>предложения: {compositionPlan.summary.proposals}</span>
          {compositionPlan.proposals.slice(0, 4).map((proposal, index) => (
            <small key={`${proposal.type}-${proposal.blockId ?? index}`}>
              {proposal.blockId ? `${proposal.blockId}: ` : ""}
              {proposal.message}
            </small>
          ))}
        </div>
      )}
    </div>
  );
}
