export const LAYOUT_RELATION_CHILD_KINDS = {
  WORKSPACE_ITEM: "workspace-item",
  INTERNAL_CONTENT_ITEM: "internal-content-item"
};

export const LAYOUT_RELATION_CHILD_ROLES = {
  CHILD: "child",
  CONTENT: "content",
  CONTROL: "control",
  WARNING: "warning",
  ACTION: "action",
  DETAILS: "details",
  ASIDE: "aside"
};

export const DEFAULT_LAYOUT_RELATION_CHILD_ROLE = LAYOUT_RELATION_CHILD_ROLES.CHILD;

export const LAYOUT_RELATION_STACK_MODES = {
  BELOW: "below",
  ABOVE: "above",
  LEFT: "left",
  RIGHT: "right",
  AUTO: "auto"
};

export const DEFAULT_LAYOUT_RELATIONS = {
  version: 1,
  children: []
};
