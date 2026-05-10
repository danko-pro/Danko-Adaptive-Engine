import { REJECTION_ERRORS } from "./rejectionErrorCodes.js";

const rejectionMessages = {
  [REJECTION_ERRORS.UNKNOWN_REJECTION]: "Операция отклонена: причина не определена.",
  [REJECTION_ERRORS.AREA_COLLISION]: "Операция отклонена: область пересекается с другим блоком.",
  [REJECTION_ERRORS.AREA_OUT_OF_BOUNDS]: "Операция отклонена: область выходит за границы сетки.",
  [REJECTION_ERRORS.INVALID_AREA]: "Операция отклонена: область описана некорректно.",
  [REJECTION_ERRORS.INVALID_OPERATION]: "Операция отклонена: действие описано некорректно.",
  [REJECTION_ERRORS.CONSTRAINT_VIOLATION]: "Операция отклонена: нарушено ограничение области.",
  [REJECTION_ERRORS.MOVE_LOCKED]: "Операция отклонена: область запрещено перемещать.",
  [REJECTION_ERRORS.RESIZE_LOCKED]: "Операция отклонена: область запрещено изменять по размеру.",
  [REJECTION_ERRORS.NO_FREE_SPACE]: "Операция отклонена: свободное место не найдено."
};

// Explain Rejection
// Превращает код отказа в человекочитаемое сообщение.

export function explainRejection(code, details = {}) {
  const baseMessage = rejectionMessages[code] ?? rejectionMessages[REJECTION_ERRORS.UNKNOWN_REJECTION];
  const blockerText = details.blockerId ? ` Блокирует: ${details.blockerId}.` : "";
  const targetText = details.targetId ? ` Цель: ${details.targetId}.` : "";

  return `${baseMessage}${targetText}${blockerText}`;
}
