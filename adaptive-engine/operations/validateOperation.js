// Валидация operation
// Проверяет форму operation до применения к layout items.

import { createOperation } from "./createOperation.js";
import { createOperationError } from "./createOperationError.js";
import { OPERATION_ERRORS } from "./operationErrorCodes.js";
import { OPERATION_TYPES } from "./operationTypes.js";

export function validateOperation(rawOperation) {
  const operation = createOperation(rawOperation);
  const errors = [];

  if (!Object.values(OPERATION_TYPES).includes(operation.type)) {
    errors.push(
      createOperationError(OPERATION_ERRORS.UNKNOWN_TYPE, {
        operationType: operation.type
      })
    );
  }

  if (!operation.targetId) {
    errors.push(
      createOperationError(OPERATION_ERRORS.MISSING_TARGET_ID, {
        operationType: operation.type
      })
    );
  }

  if (
    operation.type === OPERATION_TYPES.CREATE_AREA ||
    operation.type === OPERATION_TYPES.SET_AREA
  ) {
    errors.push(...validateAreaPayload(operation));
  }

  if (operation.type === OPERATION_TYPES.RESIZE_AREA) {
    errors.push(...validateResizeAreaPayload(operation));
  }

  if (operation.type === OPERATION_TYPES.MOVE_AREA) {
    errors.push(...validateMoveAreaPayload(operation));
  }

  return {
    valid: errors.length === 0,
    operation,
    errors
  };
}

function validateAreaPayload(operation) {
  return [
    ...validateMoveAreaPayload(operation),
    ...validateResizeAreaPayload(operation)
  ];
}

function validateMoveAreaPayload(operation) {
  const errors = [];
  const x = Number(operation.payload.x);
  const y = Number(operation.payload.y);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    errors.push(
      createOperationError(OPERATION_ERRORS.INVALID_PAYLOAD, {
        operationType: operation.type,
        targetId: operation.targetId,
        details: {
          required: ["x", "y"]
        }
      })
    );

    return errors;
  }

  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1) {
    errors.push(
      createOperationError(OPERATION_ERRORS.INVALID_POSITION, {
        operationType: operation.type,
        targetId: operation.targetId,
        details: {
          x,
          y
        }
      })
    );
  }

  return errors;
}

function validateResizeAreaPayload(operation) {
  const errors = [];
  const w = Number(operation.payload.w);
  const h = Number(operation.payload.h);

  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    errors.push(
      createOperationError(OPERATION_ERRORS.INVALID_PAYLOAD, {
        operationType: operation.type,
        targetId: operation.targetId,
        details: {
          required: ["w", "h"]
        }
      })
    );

    return errors;
  }

  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) {
    errors.push(
      createOperationError(OPERATION_ERRORS.INVALID_SIZE, {
        operationType: operation.type,
        targetId: operation.targetId,
        details: {
          w,
          h
        }
      })
    );
  }

  return errors;
}
