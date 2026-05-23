import { FixedSidebarIcon } from "../icons/GridDebugIcons.jsx";
import { resolveSidebarFixedToggle } from "./resolveSidebarFixedToggle.js";

export function SidebarSettingsMenu({
  item,
  settings,
  onSetSidebarState
}) {
  const { active, nextState, title } = resolveSidebarFixedToggle(settings);

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
    </section>
  );
}
