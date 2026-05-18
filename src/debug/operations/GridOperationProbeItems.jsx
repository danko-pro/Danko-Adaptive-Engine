import { useRef, useState } from "react";
import { OperationCenterToast } from "./OperationCenterToast.jsx";
import { OperationItemControls } from "./OperationItemControls.jsx";
import { OperationMenuLayer } from "./OperationMenuLayer.jsx";
import { OperationPageTransitionLayer } from "./OperationPageTransitionLayer.jsx";
import { OperationRenderLayers } from "./OperationRenderLayers.jsx";
import { OperationSidebarReservedBoundary } from "./OperationSidebarReservedBoundary.jsx";
import { createCompositionInfoById } from "./operationCompositionInfo.js";
import {
  isSidebarContentOperationMenuTarget,
  resolveOperationMenuTargetItem
} from "./operationMenuTarget.js";
import { resolveOperationRenderLayers } from "./resolveOperationRenderLayers.js";

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
  onOpenSidebarContentItemMenu,
  onSelectSidebarContentItem,
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
  const renderLayers = resolveOperationRenderLayers(renderItems, { metrics });
  const itemElementMapRef = useRef(new Map());
  const menuSourceItem = resolveOperationMenuTargetItem({ target: menuTarget, items });
  const menuRenderItem = resolveOperationMenuTargetItem({ target: menuTarget, items: renderItems });
  const menuItem = isSidebarContentOperationMenuTarget(menuTarget)
    ? menuRenderItem ?? menuSourceItem
    : menuSourceItem;
  const sourceItemById = createItemById(items);
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
        onToggleSidebarReservedBoundary={() => setShowSidebarReservedBoundary((current) => !current)}
        onStartMove={onStartMove}
        onActivateSidebarContentItem={onActivateSidebarContentItem}
        onOpenMenu={onOpenMenu}
        onOpenSidebarContentItemMenu={onOpenSidebarContentItemMenu}
        onSelectSidebarContentItem={onSelectSidebarContentItem}
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
      <OperationMenuLayer
        target={menuTarget}
        item={menuItem}
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
        onSetSidebarSettings={onSetSidebarSettings}
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
