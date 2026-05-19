export const MOBILE_SIDEBAR_CONTENT_RENDER_MODES = {
  DESKTOP_CONTENT: "desktop-content",
  COMPACT_BUTTON: "compact-button",
  ICON_STRIP_CONTENT: "icon-strip-content",
  HIDDEN: "hidden"
};

export function resolveMobileSidebarContentRenderMode(renderInfo) {
  const hasContent = (
    renderInfo?.areaMode === "expanded" &&
    Array.isArray(renderInfo?.sidebar?.content?.items) &&
    renderInfo.sidebar.content.items.length > 0
  );
  const presentationMode = renderInfo?.mobilePresentation?.mode;

  if (presentationMode === "compact-menu-button") {
    return MOBILE_SIDEBAR_CONTENT_RENDER_MODES.COMPACT_BUTTON;
  }

  if (presentationMode === "icon-strip") {
    return hasContent
      ? MOBILE_SIDEBAR_CONTENT_RENDER_MODES.ICON_STRIP_CONTENT
      : MOBILE_SIDEBAR_CONTENT_RENDER_MODES.HIDDEN;
  }

  return hasContent
    ? MOBILE_SIDEBAR_CONTENT_RENDER_MODES.DESKTOP_CONTENT
    : MOBILE_SIDEBAR_CONTENT_RENDER_MODES.HIDDEN;
}
