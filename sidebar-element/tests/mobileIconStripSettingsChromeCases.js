import assert from "node:assert/strict";
import {
  MOBILE_ICON_STRIP_SETTINGS_LABEL,
  resolveMobileIconStripSettingsChrome
} from "../render/resolveMobileIconStripSettingsChrome.js";

const chrome = resolveMobileIconStripSettingsChrome();

assert.equal(chrome.label, MOBILE_ICON_STRIP_SETTINGS_LABEL);
assert.equal(chrome.glyph, "⚙");
assert.equal(
  chrome.className,
  "grid-operation-mobile-sidebar-icon-strip-settings"
);

console.log("mobile icon strip settings chrome tests passed");
