// Применение operation
// Применяет operation к layout items и передает результат обратно в layout pipeline.

import { processLayoutItems } from "../layout/processLayoutItems.js";
import { LAYOUT_ERRORS } from "../layout/layoutErrorCodes.js";
import { CONSTRAINT_ERRORS, resolveConstraint } from "../constraints/index.js";
import { createEngineResult as createBaseEngineResult } from "../contracts/index.js";
import { REJECTION_ERRORS, resolveRejection } from "../rejections/index.js";
import { createOperationError } from "./createOperationError.js";
import { createOperationReport } from "./createOperationReport.js";
import { OPERATION_ERRORS } from "./operationErrorCodes.js";
import { OPERATION_TYPES } from "./operationTypes.js";
import { validateOperation } from "./validateOperation.js";

export function applyOperation(items, rawOperation, metrics, constraints = null) {
  const sourceItems = Array.isArray(items) ? items : [];
  const operationValidation = validateOperation(rawOperation);

  if (!operationValidation.valid) {
    return createOperationResult({
      valid: false,
      sourceItems,
      items: sourceItems,
      operation: operationValidation.operation,
      errors: operationValidation.errors,
      rejection: createOperationRejection(operationValidation.operation, operationValidation.errors)
    });
  }

  const operation = operationValidation.operation;
  const needsExistingTarget = operation.type !== OPERATION_TYPES.CREATE_AREA;
  const targetExists = sourceItems.some((item) => String(item?.id) === operation.targetId);

  if (needsExistingTarget && !targetExists) {
    const errors = [
      createOperationError(OPERATION_ERRORS.TARGET_NOT_FOUND, {
        operationType: operation.type,
        targetId: operation.targetId
      })
    ];

    return createOperationResult({
      valid: false,
      sourceItems,
      items: sourceItems,
      operation,
      errors,
      rejection: createOperationRejection(operation, errors)
    });
  }

  const nextItems = applyKnownOperation(sourceItems, operation);
  const constraintResult = validateOperationConstraints(sourceItems, nextItems, operation, constraints);

  if (!constraintResult.valid) {
    const errors = [
      createOperationError(constraintResult.error, {
        operationType: operation.type,
        targetId: operation.targetId,
        details: {
          constraint: constraintResult.constraint,
          area: constraintResult.area
        }
      })
    ];

    return createOperationResult({
      valid: false,
      sourceItems,
      items: sourceItems,
      operation,
      errors,
      rejection: createOperationRejection(operation, errors)
    });
  }

  const layoutResult = processLayoutItems(nextItems, metrics);

  return createOperationResult({
    valid: layoutResult.valid,
    sourceItems,
    items: layoutResult.valid ? nextItems : sourceItems,
    operation,
    errors: layoutResult.errors,
    layout: layoutResult,
    rejection: layoutResult.valid ? null : createOperationRejection(operation, layoutResult.errors)
  });
}

function validateOperationConstraints(sourceItems, nextItems, operation, constraints) {
  const targetConstraint = findConstraintForTarget(operation?.targetId, constraints);

  if (!targetConstraint) {
    return {
      valid: true,
      error: null
    };
  }

  const sourceArea = sourceItems.find((item) => String(item?.id) === operation.targetId);
  const nextArea = nextItems.find((item) => String(item?.id) === operation.targetId);

  if (!nextArea) {
    return {
      valid: true,
      error: null
    };
  }

  const constraintResult = resolveConstraint(sourceArea ?? nextArea, {
    ...targetConstraint,
    nextArea
  });

  return {
    valid: constraintResult.valid,
    error: constraintResult.error,
    area: constraintResult.area,
    constraint: constraintResult.constraint
  };
}

function findConstraintForTarget(targetId, constraints) {
  if (!targetId || !constraints) {
    return null;
  }

  if (Array.isArray(constraints)) {
    return constraints.find((constraint) => String(constraint?.id) === targetId) ?? null;
  }

  if (typeof constraints === "object") {
    return constraints[targetId] ?? constraints[String(targetId)] ?? null;
  }

  return null;
}

function applyKnownOperation(items, operation) {
  if (operation.type === OPERATION_TYPES.CREATE_AREA) {
    return [
      ...items,
      {
        id: operation.targetId,
        x: Number(operation.payload.x),
        y: Number(operation.payload.y),
        w: Number(operation.payload.w),
        h: Number(operation.payload.h),
        meta: { ...operation.meta }
      }
    ];
  }

  if (operation.type === OPERATION_TYPES.DELETE_AREA) {
    return items.filter((item) => String(item?.id) !== operation.targetId);
  }

  if (operation.type === OPERATION_TYPES.MOVE_AREA) {
    return items.map((item) => {
      if (String(item?.id) !== operation.targetId) {
        return item;
      }

      return {
        ...item,
        x: Number(operation.payload.x),
        y: Number(operation.payload.y)
      };
    });
  }

  if (operation.type === OPERATION_TYPES.SET_AREA) {
    return items.map((item) => {
      if (String(item?.id) !== operation.targetId) {
        return item;
      }

      return {
        ...item,
        x: Number(operation.payload.x),
        y: Number(operation.payload.y),
        w: Number(operation.payload.w),
        h: Number(operation.payload.h),
        meta: {
          ...(item.meta ?? {}),
          ...operation.meta
        }
      };
    });
  }

  if (operation.type === OPERATION_TYPES.RESIZE_AREA) {
    return items.map((item) => {
      if (String(item?.id) !== operation.targetId) {
        return item;
      }

      return {
        ...item,
        w: Number(operation.payload.w),
        h: Number(operation.payload.h)
      };
    });
  }

  return items;
}

function createOperationResult({
  valid,
  sourceItems = [],
  items,
  operation,
  errors = [],
  layout = null,
  rejection = null
}) {
  const report = createOperationReport({
    valid,
    sourceItems,
    resultItems: items,
    operation,
    errors,
    rejection
  });

  return createOperationEngineResult({
    valid,
    action: operation?.type ?? null,
    data: {
      items,
      operation
    },
    errors,
    rejection,
    report,
    meta: {
      received: items.length
    },
    details: {
      layout
    }
  });
}

function createOperationEngineResult(options) {
  const result = createBaseEngineResult(options);

  return {
    ...result,
    items: result.data.items,
    operation: result.data.operation,
    layout: result.details.layout,
    meta: {
      ...result.meta,
      received: options.meta?.received ?? result.data.items.length
    }
  };
}

function createOperationRejection(operation, errors = []) {
  const primaryError = errors[0] ?? null;
  const code = mapErrorToRejectionCode(primaryError);
  const collisionBlockerId = findCollisionBlockerId(operation, primaryError);

  return resolveRejection({
    code,
    source: "operations",
    targetId: operation?.targetId ?? primaryError?.itemId ?? null,
    blockerId: collisionBlockerId,
    details: {
      operationType: operation?.type ?? null,
      targetId: operation?.targetId ?? null,
      errorType: primaryError?.type ?? null,
      errors
    }
  });
}

function mapErrorToRejectionCode(error) {
  if (!error?.type) {
    return REJECTION_ERRORS.UNKNOWN_REJECTION;
  }

  if (error.type === LAYOUT_ERRORS.AREA_COLLISION) {
    return REJECTION_ERRORS.AREA_COLLISION;
  }

  if (error.type === LAYOUT_ERRORS.OUT_OF_GRID) {
    return REJECTION_ERRORS.AREA_OUT_OF_BOUNDS;
  }

  if ([
    LAYOUT_ERRORS.INVALID_NUMBERS,
    LAYOUT_ERRORS.INVALID_INTEGER,
    LAYOUT_ERRORS.INVALID_SIZE,
    LAYOUT_ERRORS.DUPLICATE_ID,
    LAYOUT_ERRORS.MISSING_ID
  ].includes(error.type)) {
    return REJECTION_ERRORS.INVALID_AREA;
  }

  if (Object.values(OPERATION_ERRORS).includes(error.type)) {
    return REJECTION_ERRORS.INVALID_OPERATION;
  }

  if (error.type === CONSTRAINT_ERRORS.MOVE_LOCKED) {
    return REJECTION_ERRORS.MOVE_LOCKED;
  }

  if (error.type === CONSTRAINT_ERRORS.RESIZE_LOCKED) {
    return REJECTION_ERRORS.RESIZE_LOCKED;
  }

  if (Object.values(CONSTRAINT_ERRORS).includes(error.type)) {
    return REJECTION_ERRORS.CONSTRAINT_VIOLATION;
  }

  return REJECTION_ERRORS.UNKNOWN_REJECTION;
}

function findCollisionBlockerId(operation, error) {
  if (error?.type !== LAYOUT_ERRORS.AREA_COLLISION || !Array.isArray(error.itemIds)) {
    return null;
  }

  return error.itemIds.find((itemId) => String(itemId) !== operation?.targetId) ?? null;
}
