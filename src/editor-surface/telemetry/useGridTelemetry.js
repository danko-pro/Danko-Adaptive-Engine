import { useEffect, useRef, useState } from "react";
import {
  createGridTelemetryDiff,
  createGridTelemetrySnapshot
} from "./createGridTelemetrySnapshot.js";

const MAX_TELEMETRY_RECORDS = 80;

export function useGridTelemetry({ metrics, items, selection }) {
  const previousSnapshotRef = useRef(null);
  const previousSignatureRef = useRef("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const snapshot = createGridTelemetrySnapshot({ metrics, items, selection });
    const signature = JSON.stringify(snapshot);

    if (signature === previousSignatureRef.current) {
      return;
    }

    const diff = createGridTelemetryDiff(previousSnapshotRef.current, snapshot);
    const record = {
      id: `${Date.now()}-${records.length}`,
      changes: diff.changes,
      delta: diff.delta,
      snapshot
    };

    previousSignatureRef.current = signature;
    previousSnapshotRef.current = snapshot;

    setRecords((current) => {
      const nextRecords = [record, ...current].slice(0, MAX_TELEMETRY_RECORDS);

      globalThis.__adaptiveTelemetry = {
        latest: record,
        records: nextRecords,
        table() {
          return nextRecords.map(formatTelemetryRecordForTable);
        },
        clear() {
          globalThis.__adaptiveTelemetry.records = [];
        }
      };

      return nextRecords;
    });
  }, [items, metrics, records.length, selection]);

  function clearTelemetry() {
    setRecords([]);
    globalThis.__adaptiveTelemetry = {
      latest: null,
      records: [],
      table() {
        return [];
      },
      clear: clearTelemetry
    };
  }

  return {
    records,
    latest: records[0] ?? null,
    clearTelemetry
  };
}

function formatTelemetryRecordForTable(record) {
  return {
    time: record.snapshot.time,
    changes: record.changes.join(", "),
    columns: record.snapshot.metrics.columns,
    rows: record.snapshot.metrics.rows,
    cellSize: record.snapshot.metrics.cellSize,
    deltaCell: record.delta["metrics.cellSize"]?.value ?? "",
    workspaceWidth: record.snapshot.metrics.workspaceWidth,
    deltaWorkspaceWidth: record.delta["metrics.workspaceWidth"]?.value ?? "",
    workspaceHeight: record.snapshot.metrics.workspaceHeight,
    deltaWorkspaceHeight: record.delta["metrics.workspaceHeight"]?.value ?? "",
    gridWidth: record.snapshot.metrics.gridWidth,
    deltaGridWidth: record.delta["metrics.gridWidth"]?.value ?? "",
    gridHeight: record.snapshot.metrics.gridHeight,
    deltaGridHeight: record.delta["metrics.gridHeight"]?.value ?? "",
    blocks: record.snapshot.items.length
  };
}
