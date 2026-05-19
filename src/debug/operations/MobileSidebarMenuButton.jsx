import { resolveMobileSidebarMenuButtonState } from "./mobileSidebarMenuButtonState.js";

export function MobileSidebarMenuButton({
  presentation,
  open = false,
  onToggle
}) {
  const buttonState = resolveMobileSidebarMenuButtonState({ presentation, open });

  if (!buttonState.visible) {
    return null;
  }

  const buttonArea = presentation.buttonArea;

  return (
    <button
      type="button"
      className={buttonState.className}
      aria-label={buttonState.label}
      aria-expanded={open}
      style={{
        gridColumn: `${buttonArea.x} / span ${buttonArea.w}`,
        gridRow: `${buttonArea.y} / span ${buttonArea.h}`
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle?.();
      }}
    >
      {buttonState.glyph}
    </button>
  );
}
