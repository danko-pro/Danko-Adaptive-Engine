import { OPERATION_TYPES } from "../../adaptive-engine/core/index.js";

export function createOperationFromForm(form) {
  if (form.type === OPERATION_TYPES.DELETE_AREA) {
    return {
      type: form.type,
      targetId: form.targetId
    };
  }

  if (form.type === OPERATION_TYPES.MOVE_AREA) {
    return {
      type: form.type,
      targetId: form.targetId,
      payload: {
        x: Number(form.x),
        y: Number(form.y)
      }
    };
  }

  if (form.type === OPERATION_TYPES.RESIZE_AREA) {
    return {
      type: form.type,
      targetId: form.targetId,
      payload: {
        w: Number(form.w),
        h: Number(form.h)
      }
    };
  }

  return {
    type: form.type,
    targetId: form.targetId,
    payload: {
      x: Number(form.x),
      y: Number(form.y),
      w: Number(form.w),
      h: Number(form.h)
    }
  };
}
