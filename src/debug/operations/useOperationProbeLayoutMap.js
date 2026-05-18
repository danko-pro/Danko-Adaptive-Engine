import { useEffect, useState } from "react";
import { createAdapterLayoutMap } from "../../../engine-adapter/index.js";

export function useOperationProbeLayoutMap({ items, metrics }) {
  const [layoutMap, setLayoutMap] = useState(null);
  const [layoutMapStatus, setLayoutMapStatus] = useState("карта: не сохранена");
  const [showLayoutMapOverlay, setShowLayoutMapOverlay] = useState(false);

  useEffect(() => {
    captureLayoutMap(items, metrics, {
      statusPrefix: "Карта создана автоматически"
    });
  }, []);

  function captureLayoutMap(sourceItems = items, sourceMetrics = metrics, options = {}) {
    const command = createAdapterLayoutMap({
      items: sourceItems,
      metrics: sourceMetrics
    });

    if (!command.ok) {
      setLayoutMap(null);
      setLayoutMapStatus(command.message);
      return;
    }

    setLayoutMap(command.data.map);
    setLayoutMapStatus(options.statusPrefix ? `${options.statusPrefix}: ${command.message}` : command.message);
  }

  function markProjectedItems(statusPrefix) {
    setLayoutMapStatus(`${statusPrefix}: авторская карта не изменена.`);
  }

  function toggleLayoutMapOverlay() {
    setShowLayoutMapOverlay((current) => !current);
  }

  return {
    layoutMap,
    layoutMapStatus,
    showLayoutMapOverlay,
    captureLayoutMap,
    markProjectedItems,
    toggleLayoutMapOverlay
  };
}
