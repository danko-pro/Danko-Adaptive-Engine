export function canStartMobileSidebarButtonMove({ selected = false } = {}) {
  return selected === true;
}

export function shouldToggleMobileSidebarMenuFromClick({
  selected = false,
  dragged = false
} = {}) {
  return selected !== true && dragged !== true;
}

export function shouldEnterMobileSidebarButtonEditModeFromDoubleClick() {
  return {
    select: true,
    openMenu: true,
    toggle: false,
    cancelPending: true
  };
}
