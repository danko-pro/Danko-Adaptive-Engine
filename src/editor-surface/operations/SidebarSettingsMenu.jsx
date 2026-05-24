import { FixedSidebarIcon } from "../icons/GridDebugIcons.jsx";
import {
  SIDEBAR_MOBILE_RENDER_STRATEGIES,
  resolveSidebarMobileRenderStrategyToggle
} from "../../../sidebar-element/index.js";
import { resolveSidebarFixedToggle } from "./resolveSidebarFixedToggle.js";

export function SidebarSettingsMenu({
  item,
  settings,
  onSetSidebarState,
  onSetSidebarSettings
}) {
  const { active, nextState, title } = resolveSidebarFixedToggle(settings);
  const mobileStrategyToggle = resolveSidebarMobileRenderStrategyToggle(settings);

  return (
    <section className="grid-operation-sidebar-panel" aria-label="Настройки сайдбара">
      <div className="grid-operation-sidebar-section is-state">
        <div className="grid-operation-sidebar-icon-row" aria-label="Состояние сайдбара">
          <button
            type="button"
            className={active ? "is-active" : ""}
            title={title}
            aria-label={title}
            aria-pressed={active}
            onClick={(event) => onSetSidebarState?.(event, item, nextState)}
          >
            <FixedSidebarIcon />
          </button>
        </div>
      </div>
      <div className="grid-operation-sidebar-section is-mobile-strategy">
        <div className="grid-operation-sidebar-section-heading">
          <div className="grid-operation-sidebar-section-title">Мобильный режим</div>
          <span className="grid-operation-sidebar-section-scope">{mobileStrategyToggle.scopeLabel}</span>
        </div>
        <div className="grid-operation-sidebar-icon-row" aria-label="Мобильный режим сайдбара">
          <button
            type="button"
            className={mobileStrategyToggle.compactClassName}
            title={mobileStrategyToggle.compactTitle}
            aria-label={mobileStrategyToggle.compactTitle}
            aria-pressed={mobileStrategyToggle.isCompactMenuButton}
            onClick={(event) => onSetSidebarSettings?.(event, item, {
              mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
            })}
          >
            {"\u25C9"}
          </button>
          <button
            type="button"
            className={mobileStrategyToggle.iconStripClassName}
            title={mobileStrategyToggle.iconStripTitle}
            aria-label={mobileStrategyToggle.iconStripTitle}
            aria-pressed={mobileStrategyToggle.isIconStrip}
            onClick={(event) => onSetSidebarSettings?.(event, item, {
              mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.ICON_STRIP
            })}
          >
            {"\u25A4"}
          </button>
        </div>
      </div>
    </section>
  );
}
