import { explainRejection, SELECTION_TYPES } from "../../adaptive-engine/core/index.js";

const adapterErrorMessages = {
  INVALID_INTENT: "Действие описано некорректно.",
  UNKNOWN_TYPE: "Неизвестный тип действия.",
  INVALID_CELL: "Ячейка указана некорректно.",
  INVALID_SIZE: "Размер области указан некорректно.",
  MISSING_VALUE: "Введите имя блока.",
  TARGET_NOT_FOUND: "Блок не найден.",
  INVALID_PAYLOAD: "Данные действия указаны некорректно.",
  INVALID_POSITION: "Позиция указана некорректно.",
  AREA_COLLISION: "Область пересекается с другим блоком.",
  AREA_OUT_OF_BOUNDS: "Область выходит за границы сетки.",
  OUT_OF_GRID: "Область выходит за границы сетки.",
  INVALID_AREA: "Область описана некорректно.",
  INVALID_OPERATION: "Действие описано некорректно.",
  CONSTRAINT_VIOLATION: "Нарушено ограничение области.",
  MOVE_LOCKED: "Блок нельзя перемещать.",
  RESIZE_LOCKED: "Блок нельзя менять по размеру.",
  NO_FREE_SPACE: "Свободное место не найдено.",
  UNKNOWN_REJECTION: "Действие отклонено."
};

export function formatAdapterErrors(errors = []) {
  if (typeof errors === "number") {
    return errors === 0 ? "none" : String(errors);
  }

  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const entries = Object.entries(errors);

    if (entries.length === 0) {
      return "none";
    }

    return entries.map(([type, count]) => `${type}:${count}`).join(", ");
  }

  if (errors.length === 0) {
    return "none";
  }

  return errors.map((error) => error.type).join(", ");
}

export function formatAdapterErrorMessage(error) {
  const type = typeof error === "string" ? error : error?.type ?? error?.code;

  return adapterErrorMessages[type] ?? type ?? "Неизвестная ошибка.";
}

export function formatAdapterErrorSummary(errors = []) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Ошибок нет.";
  }

  return errors.map(formatAdapterErrorMessage).join(" ");
}

export function formatRejectionMessage(rejection) {
  if (!rejection?.code) {
    return "Действие отклонено.";
  }

  return explainRejection(rejection);
}

export function formatOperationReportStatus(report) {
  if (!report) {
    return "Действие еще не выполнялось.";
  }

  if (report.valid) {
    return report.changed ? "Действие принято. Блок обновлен." : "Действие принято. Изменений нет.";
  }

  return formatAdapterErrorSummary(report.errors);
}

export function formatSelectionStatus(selection) {
  if (selection?.type === SELECTION_TYPES.AREA) {
    const label = formatItemLabel(selection.item);
    const name = label ? `"${label}"` : selection.itemId;

    return `Выбран блок ${name}`;
  }

  if (selection?.cell) {
    return `Выбрана ячейка ${selection.cell.x}:${selection.cell.y}`;
  }

  return "Выбор пуст";
}

export function formatItemLabel(item) {
  if (item?.meta?.value !== undefined && item.meta.value !== null && item.meta.value !== "") {
    return String(item.meta.value);
  }

  if (String(item?.id).startsWith("cell-")) {
    return "";
  }

  return item?.id ?? "";
}

export function formatTargetLabel(items, targetId) {
  const target = items.find((item) => String(item.id) === String(targetId));
  const label = formatItemLabel(target);

  return label || targetId;
}
