import { useRef, useState } from "react";
import { OperationCenterToast } from "./OperationCenterToast.jsx";
import { OperationItemControls } from "./OperationItemControls.jsx";
import { OperationMobileSidebarButtonControls } from "./OperationMobileSidebarButtonControls.jsx";
import { OperationMenuLayer } from "./OperationMenuLayer.jsx";
import { OperationPageTransitionLayer } from "./OperationPageTransitionLayer.jsx";
import { OperationRenderLayers } from "./OperationRenderLayers.jsx";
import { OperationSidebarReservedBoundary } from "./OperationSidebarReservedBoundary.jsx";
import {
  closeAllMobileSidebarMenus,
  closeMobileSidebarMenu,
  createMobileSidebarRuntimeState,
  resolveOperationRenderLayers,
  toggleMobileSidebarMenuOpen
} from "../../../sidebar-element/index.js";
import { createCompositionInfoById } from "./operationCompositionInfo.js";
import {
  isMobileSidebarButtonOperationMenuTarget,
  isSidebarContentOperationMenuTarget,
  resolveOperationMenuTargetItem
} from "./operationMenuTarget.js";

export function GridOperationProbeItems({
  items,
  renderItems = items,
  pageTransition = null,
  metrics,
  selection,
  compositionPlan,
  showCompositionOverlay,
  menuTarget,
  menuMode,
  centerToast,
  renameValue,
  onStartMove,
  onStartResize,
  onActivateSidebarContentItem,
  onOpenMenu,
  onOpenMobileSidebarButtonMenu,
  onOpenSidebarContentItemMenu,
  onSelectMobileSidebarButton,
  onSelectSidebarContentItem,
  onSelectSidebarShell,
  onStartMobileSidebarButtonMove,
  onStartMobileSidebarButtonResize,
  onStartSidebarContentItemMove,
  onStartSidebarContentItemResize,
  onCloseMenu,
  onCopyItem,
  onCreateLinkedBlock,
  onDeleteItem,
  onRenameItem,
  onRenameSidebarContentItem,
  onSetSidebarSettings,
  onSetSidebarState,
  onStartRenameSidebarContentItem,
  onStartRenameItem,
  onUpdateRenameValue,
  onUpdateSidebarContentItemGeometry,
  onUpdateSidebarContentItemPatch,
  onUpdateSidebarContentItemStyle
}) {
  const compositionInfoById = createCompositionInfoById(compositionPlan);
  const [showSidebarReservedBoundary, setShowSidebarReservedBoundary] = useState(true);
  const [mobileSidebarRuntimeState, setMobileSidebarRuntimeState] = useState(
    createMobileSidebarRuntimeState
  );
  const renderLayers = resolveOperationRenderLayers(renderItems, { metrics });
  const itemElementMapRef = useRef(new Map());
  const menuSourceItem = resolveOperationMenuTargetItem({ target: menuTarget, items });
  const menuRenderItem = resolveOperationMenuTargetItem({ target: menuTarget, items: renderItems });
  const menuItem = isSidebarContentOperationMenuTarget(menuTarget)
    ? menuRenderItem ?? menuSourceItem
    : menuSourceItem;
  const resolvedMenuItem = isMobileSidebarButtonOperationMenuTarget(menuTarget)
    ? menuRenderItem ?? menuSourceItem
    : menuItem;
  const sourceItemById = createItemById(items);

  function handleSetSidebarSettings(event, sidebarItem, patch) {
    onSetSidebarSettings?.(event, sidebarItem, patch);

    if (patch?.mobileRenderStrategy !== undefined) {
      setMobileSidebarRuntimeState(closeAllMobileSidebarMenus());
    }
  }

  const selectedItem = resolveRenderedSelectedItem({
    items,
    selection,
    itemRenderInfoById: renderLayers.itemRenderInfoById
  });

  return (
    <>
      <OperationRenderLayers
        layers={renderLayers.itemLayers}
        selection={selection}
        compositionInfoById={compositionInfoById}
        showCompositionOverlay={showCompositionOverlay}
        menuTarget={menuTarget}
        itemRenderInfoById={renderLayers.itemRenderInfoById}
        sourceItemById={sourceItemById}
        itemElementMapRef={itemElementMapRef}
        pageTransition={pageTransition}
        showSidebarReservedBoundary={showSidebarReservedBoundary}
        mobileSidebarRuntimeState={mobileSidebarRuntimeState}
        onToggleSidebarReservedBoundary={() => setShowSidebarReservedBoundary((current) => !current)}
        onToggleMobileSidebarMenu={({ sidebarItemId, viewportMode }) => {
          setMobileSidebarRuntimeState((currentState) => toggleMobileSidebarMenuOpen(currentState, {
            sidebarItemId,
            viewportMode
          }));
        }}
        onCloseMobileSidebarMenu={({ sidebarItemId, viewportMode }) => {
          setMobileSidebarRuntimeState((currentState) => closeMobileSidebarMenu(currentState, {
            sidebarItemId,
            viewportMode
          }));
        }}
          onStartMove={onStartMove}
          onActivateSidebarContentItem={onActivateSidebarContentItem}
          onOpenMenu={onOpenMenu}
          onOpenMobileSidebarButtonMenu={onOpenMobileSidebarButtonMenu}
          onOpenSidebarContentItemMenu={onOpenSidebarContentItemMenu}
          onSelectMobileSidebarButton={onSelectMobileSidebarButton}
          onSelectSidebarContentItem={onSelectSidebarContentItem}
          onSelectSidebarShell={onSelectSidebarShell}
          onStartMobileSidebarButtonMove={onStartMobileSidebarButtonMove}
          onStartSidebarContentItemMove={onStartSidebarContentItemMove}
          onStartSidebarContentItemResize={onStartSidebarContentItemResize}
      />
      <OperationPageTransitionLayer
        items={pageTransition?.exitingItems ?? []}
        transition={pageTransition}
      />
      <OperationSidebarReservedBoundary enabled={showSidebarReservedBoundary} items={items} metrics={metrics} />
      <OperationItemControls
        item={selectedItem}
        renderInfo={selectedItem ? renderLayers.itemRenderInfoById.get(String(selectedItem.id)) : null}
        onStartResize={onStartResize}
      />
      <OperationMobileSidebarButtonControls
        selection={selection}
        itemRenderInfoById={renderLayers.itemRenderInfoById}
        sourceItemById={sourceItemById}
        onStartResize={onStartMobileSidebarButtonResize}
      />
      <OperationMenuLayer
        target={menuTarget}
        item={resolvedMenuItem}
        items={items}
        itemElementMapRef={itemElementMapRef}
        mode={menuMode}
        renameValue={renameValue}
        onClose={onCloseMenu}
        onCopy={onCopyItem}
        onCreateLinkedBlock={onCreateLinkedBlock}
        onDelete={onDeleteItem}
        onRename={onRenameItem}
        onRenameSidebarContentItem={onRenameSidebarContentItem}
        onSetSidebarSettings={handleSetSidebarSettings}
        onSetSidebarState={onSetSidebarState}
        onStartRenameSidebarContentItem={onStartRenameSidebarContentItem}
        onStartRename={onStartRenameItem}
        onUpdateRenameValue={onUpdateRenameValue}
        onUpdateSidebarContentItemGeometry={onUpdateSidebarContentItemGeometry}
        onUpdateSidebarContentItemPatch={onUpdateSidebarContentItemPatch}
        onUpdateSidebarContentItemStyle={onUpdateSidebarContentItemStyle}
      />
      <OperationCenterToast toast={centerToast} />
    </>
  );
}

function createItemById(items) {
  return new Map(items.map((item) => [String(item.id), item]));
}

function resolveRenderedSelectedItem({ items, selection, itemRenderInfoById }) {
  if (!selection?.itemId) {
    return null;
  }

  const item = items.find((currentItem) => String(currentItem.id) === String(selection.itemId));

  if (!item) {
    return null;
  }

  if (itemRenderInfoById.get(String(item.id))?.hidden) {
    return null;
  }

  return item;
}
