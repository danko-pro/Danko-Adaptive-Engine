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
  onApplyCompositionFix,
  collapsed = false,
  onToggleCollapsed
}) {
  const behaviorStateSummary = createBehaviorStateSummary(compositionPlan);
  const panelClassName = [
    "grid-operation-probe-panel",
    collapsed ? "is-collapsed" : ""
  ].filter(Boolean).join(" ");

  return (
    <div
      className={panelClassName}
      aria-label="Рабочее меню"
      style={{ width: `min(100%, ${Math.round(metrics.gridWidth)}px)` }}
    >
      <div className="grid-operation-probe-panel-body" aria-hidden={collapsed} inert={collapsed ? true : undefined}>
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
            {behaviorStateSummary.total > 0 && (
              <div className="grid-composition-state-row" aria-label="Состояния поведения V2">
                <span>состояния: {behaviorStateSummary.total}</span>
                {behaviorStateSummary.entries.map(([type, count]) => (
                  <span key={type}>
                    {formatBehaviorStateType(type)}: {count}
                  </span>
                ))}
              </div>
            )}
            {behaviorStateSummary.blocks.length > 0 && (
              <div className="grid-composition-state-list" aria-label="Состояния блоков V2">
                {behaviorStateSummary.blocks.map((block) => (
                  <small key={block.id}>
                    {block.label}: {formatBehaviorStateType(block.type)}
                    {block.recommendedMode ? ` -> ${block.recommendedMode}` : ""}
                    {block.blocked ? " / заблокирован" : ""}
                  </small>
                ))}
              </div>
            )}
            {compositionPlan.proposals.slice(0, 4).map((proposal, index) => (
              <small key={`${proposal.type}-${proposal.blockId ?? index}`}>
                {proposal.blockId ? `${proposal.blockId}: ` : ""}
                {proposal.message}
              </small>
            ))}
          </div>
        )}
      </div>
      <button
        className="grid-operation-probe-panel-toggle"
        type="button"
        aria-expanded={!collapsed}
        title={collapsed ? "Развернуть рабочее меню" : "Свернуть рабочее меню вверх"}
        onClick={onToggleCollapsed}
      >
        {collapsed ? "Показать меню" : "Свернуть меню"}
      </button>
    </div>
  );
}

function createBehaviorStateSummary(plan) {
  if (!plan || !Array.isArray(plan.blocks)) {
    return {
      total: 0,
      entries: [],
      blocks: []
    };
  }

  const counts = new Map();
  const blocks = [];

  for (const block of plan.blocks) {
    const state = block.behaviorState;

    if (!state?.type) {
      continue;
    }

    counts.set(state.type, (counts.get(state.type) ?? 0) + 1);
    blocks.push({
      id: block.id,
      label: block.contentSchema?.name ?? block.contentSchema?.type ?? block.id,
      type: state.type,
      recommendedMode: state.recommendedMode && state.recommendedMode !== state.mode
        ? state.recommendedMode
        : "",
      blocked: Boolean(state.blocked)
    });
  }

  return {
    total: blocks.length,
    entries: [...counts.entries()],
    blocks: blocks.slice(0, 6)
  };
}

function formatBehaviorStateType(type) {
  const names = {
    "static-layout": "layout",
    "overlay-available": "overlay",
    "collapse-candidate": "collapse",
    "stack-candidate": "stack",
    "blocked-by-content": "blocked",
    unknown: "unknown"
  };

  return names[type] ?? type;
}
