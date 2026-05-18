import { applySidebarSettingsCommand } from "./applySidebarSettingsCommand.js";

export function applySidebarStateCommand({
  item,
  state,
  dock
} = {}) {
  return applySidebarSettingsCommand({
    item,
    settings: {
      state,
      dock
    }
  });
}
