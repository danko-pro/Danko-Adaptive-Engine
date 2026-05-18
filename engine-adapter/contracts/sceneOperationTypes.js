export const SCENE_OPERATION_TYPES = {
  SET_SIDEBAR_STATE: "set-sidebar-state",
  SET_SIDEBAR_SETTINGS: "set-sidebar-settings",
  SET_SIDEBAR_CONTENT_ITEM: "set-sidebar-content-item"
};

export function isSceneOperationType(value) {
  return Object.values(SCENE_OPERATION_TYPES).includes(value);
}
