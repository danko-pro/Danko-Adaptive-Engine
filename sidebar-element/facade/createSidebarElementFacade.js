import { applySidebarSettingsCommand } from "../commands/applySidebarSettingsCommand.js";
import { applySidebarContentItemCommand } from "../commands/applySidebarContentItemCommand.js";
import { applySidebarStateCommand } from "../commands/applySidebarStateCommand.js";
import { createSidebarElementFromAreaCommand } from "../commands/createSidebarElementFromAreaCommand.js";
import { resolveSidebarStatePolicy } from "../contracts/sidebarStatePolicy.js";
import { createSidebarSceneProjection } from "../layer/createSidebarSceneProjection.js";
import { resolveSidebarContentItemGeometryStatus } from "../geometry/resolveSidebarContentItemGeometry.js";
import { resolveSidebarContentTextFitDiagnostics } from "../diagnostics/resolveSidebarContentTextFitDiagnostics.js";
import { resolveSidebarLayer } from "../layer/resolveSidebarLayer.js";
import { resolveSidebarReservedArea } from "../reserved/resolveSidebarReservedArea.js";

export function createSidebarElementFacade() {
  return {
    createFromArea(options = {}) {
      return createSidebarElementFromAreaCommand(options);
    },
    setState(options = {}) {
      return applySidebarStateCommand(options);
    },
    setSettings(options = {}) {
      return applySidebarSettingsCommand(options);
    },
    setContentItem(options = {}) {
      return applySidebarContentItemCommand(options);
    },
    resolveLayer(item) {
      return resolveSidebarLayer(item);
    },
    resolveStatePolicy(value) {
      return resolveSidebarStatePolicy(value);
    },
    projectScene(items = []) {
      return createSidebarSceneProjection(items);
    },
    resolveReservedArea({ items = [], metrics = null } = {}) {
      return resolveSidebarReservedArea({ items, metrics });
    },
    resolveContentTextFitDiagnostics(options = {}) {
      return resolveSidebarContentTextFitDiagnostics(options);
    },
    resolveContentItemGeometryStatus(options = {}) {
      return resolveSidebarContentItemGeometryStatus(options);
    }
  };
}
