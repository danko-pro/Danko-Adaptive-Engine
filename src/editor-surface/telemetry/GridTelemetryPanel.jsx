export function GridTelemetryPanel({ telemetry }) {
  const latest = telemetry.latest;

  return (
    <aside className="grid-telemetry-panel" aria-label="Журнал адаптации сетки">
      <header>
        <strong>Слепки адаптации</strong>
        <button type="button" onClick={telemetry.clearTelemetry}>
          очистить
        </button>
      </header>
      {!latest && <p>Слепков пока нет.</p>}
      {latest && (
        <div className="grid-telemetry-latest">
          <span>{latest.snapshot.time}</span>
          <strong>{latest.changes.join(", ")}</strong>
          <small>
            сетка {latest.snapshot.metrics.columns}x{latest.snapshot.metrics.rows}, ячейка{" "}
            {latest.snapshot.metrics.cellSize}px
            {formatDelta(latest.delta["metrics.cellSize"])}
          </small>
          <small>
            workspace {round(latest.snapshot.metrics.workspaceWidth)}x
            {round(latest.snapshot.metrics.workspaceHeight)}
            {formatDelta(latest.delta["metrics.workspaceWidth"], "w")}
            {formatDelta(latest.delta["metrics.workspaceHeight"], "h")}, blocks{" "}
            {latest.snapshot.items.length}
          </small>
        </div>
      )}
      <ol>
        {telemetry.records.slice(0, 12).map((record) => (
          <li key={record.id}>
            <span>{record.snapshot.time}</span>
            <strong>{record.changes.join(", ")}</strong>
            <small>
              {record.snapshot.metrics.columns}x{record.snapshot.metrics.rows} ·{" "}
              {record.snapshot.metrics.cellSize}px
              {formatDelta(record.delta["metrics.cellSize"])} · {record.snapshot.items.length} blocks
            </small>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function formatDelta(delta, prefix = "") {
  if (!delta || typeof delta.value !== "number") {
    return "";
  }

  const sign = delta.value > 0 ? "+" : "";
  const label = prefix ? ` ${prefix}` : "";

  return `${label} ${sign}${delta.value}`;
}
