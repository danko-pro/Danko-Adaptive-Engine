import { createSidebarElementFacade } from "../../../sidebar-element/index.js";

const sidebarElementFacade = createSidebarElementFacade();

export function resolveSidebarContentTextFitToast({
  sidebarItem,
  contentItem,
  metrics
} = {}) {
  const contentItemId = normalizeOptionalId(contentItem?.id);
  const content = sidebarItem?.meta?.sidebar?.content;

  if (!contentItemId || !content) {
    return null;
  }

  const diagnostics = sidebarElementFacade.resolveContentTextFitDiagnostics({
    content,
    cellSize: metrics?.cellSize
  });
  const diagnostic = diagnostics.diagnostics.find((currentDiagnostic) => (
    String(currentDiagnostic.itemId) === contentItemId
  ));

  if (!diagnostic) {
    return null;
  }

  return {
    code: diagnostic.code,
    itemId: diagnostic.itemId,
    message: diagnostic.message,
    severity: diagnostic.severity
  };
}

function normalizeOptionalId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}
