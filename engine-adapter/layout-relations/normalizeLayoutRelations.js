import {
  DEFAULT_LAYOUT_RELATIONS,
  LAYOUT_RELATION_CHILD_KINDS,
  LAYOUT_RELATION_STACK_MODES
} from "./layoutRelationContracts.js";

const KNOWN_CHILD_KINDS = new Set(Object.values(LAYOUT_RELATION_CHILD_KINDS));
const KNOWN_STACK_MODES = new Set(Object.values(LAYOUT_RELATION_STACK_MODES));
const DEFAULT_PRIORITY = 10;
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 20;

export function normalizeLayoutRelations(value) {
  if (!isRecord(value)) {
    return cloneDefault();
  }

  const childrenInput = Array.isArray(value.children) ? value.children : [];
  const children = [];

  for (let index = 0; index < childrenInput.length; index += 1) {
    const normalizedChild = normalizeChild(childrenInput[index], index);

    if (normalizedChild) {
      children.push(normalizedChild);
    }
  }

  return {
    version: 1,
    children
  };
}

function normalizeChild(value, index) {
  if (!isRecord(value)) {
    return null;
  }

  const id = String(value.id ?? "").trim();

  if (!id) {
    return null;
  }

  return {
    id,
    kind: normalizeChildKind(value.kind),
    role: normalizeRole(value.role),
    priority: normalizePriority(value.priority),
    order: normalizeOrder(value.order, index),
    stack: normalizeStack(value.stack),
    manualAreas: normalizeManualAreas(value.manualAreas)
  };
}

function normalizeChildKind(value) {
  const kind = String(value ?? "").trim();

  if (KNOWN_CHILD_KINDS.has(kind)) {
    return kind;
  }

  return LAYOUT_RELATION_CHILD_KINDS.WORKSPACE_ITEM;
}

function normalizeRole(value) {
  const role = String(value ?? "").trim();

  return role || "child";
}

function normalizePriority(value) {
  return clampInteger(value, DEFAULT_PRIORITY, MIN_PRIORITY, MAX_PRIORITY);
}

function normalizeOrder(value, index) {
  const order = Number(value);

  if (Number.isInteger(order) && order >= 1) {
    return order;
  }

  return index + 1;
}

function normalizeStack(value) {
  const stack = String(value ?? "").trim();

  if (KNOWN_STACK_MODES.has(stack)) {
    return stack;
  }

  return LAYOUT_RELATION_STACK_MODES.BELOW;
}

function normalizeManualAreas(value) {
  const input = isRecord(value) ? value : {};

  return {
    narrow: normalizeManualArea(input.narrow),
    mobile: normalizeManualArea(input.mobile)
  };
}

function normalizeManualArea(value) {
  return normalizeArea(value);
}

export function normalizeArea(value) {
  if (!isRecord(value)) {
    return null;
  }

  const x = normalizeGridInteger(value.x);
  const y = normalizeGridInteger(value.y);
  const w = normalizeGridInteger(value.w);
  const h = normalizeGridInteger(value.h);

  if ([x, y, w, h].some((number) => number === null)) {
    return null;
  }

  if (x < 1 || y < 1 || w < 1 || h < 1) {
    return null;
  }

  return { x, y, w, h };
}

function normalizeGridInteger(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.round(number);
}

function clampInteger(value, fallback, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  const rounded = Math.round(number);

  return Math.min(max, Math.max(min, rounded));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneDefault() {
  return {
    version: DEFAULT_LAYOUT_RELATIONS.version,
    children: []
  };
}
