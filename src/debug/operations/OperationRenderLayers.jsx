import { Fragment } from "react";
import { MobileSidebarMenuButton } from "./MobileSidebarMenuButton.jsx";
import { MobileSidebarMenuPanel } from "./MobileSidebarMenuPanel.jsx";
import { OperationGridItem } from "./OperationGridItem.jsx";
import { isMobileSidebarMenuOpen } from "./mobileSidebarRuntimeState.js";
import { isAreaOperationMenuTargetForItem } from "./operationMenuTarget.js";

export function OperationRenderLayers({
  layers,
  selection,
  compositionInfoById,
  showCompositionOverlay,
  menuTarget,
  itemRenderInfoById,
  sourceItemById,
  itemElementMapRef,
  pageTransition,
  showSidebarReservedBoundary,
  mobileSidebarRuntimeState,
  onToggleSidebarReservedBoundary,
  onToggleMobileSidebarMenu,
  onCloseMobileSidebarMenu,
  onStartMove,
  onActivateSidebarContentItem,
  onOpenMenu,
  onOpenMobileSidebarButtonMenu,
  onOpenSidebarContentItemMenu,
  onSelectMobileSidebarButton,
  onSelectSidebarContentItem,
  onStartMobileSidebarButtonMove,
  onStartSidebarContentItemMove,
  onStartSidebarContentItemResize
}) {
  return (
    <>
      {layers.map((layer) => (
        <OperationRenderLayer
          id={layer.id}
          items={layer.items}
          key={layer.id}
          selection={selection}
          compositionInfoById={compositionInfoById}
          showCompositionOverlay={showCompositionOverlay}
          menuTarget={menuTarget}
          itemRenderInfoById={itemRenderInfoById}
          sourceItemById={sourceItemById}
          itemElementMapRef={itemElementMapRef}
          pageTransition={pageTransition}
          showSidebarReservedBoundary={showSidebarReservedBoundary}
          mobileSidebarRuntimeState={mobileSidebarRuntimeState}
          onToggleSidebarReservedBoundary={onToggleSidebarReservedBoundary}
          onToggleMobileSidebarMenu={onToggleMobileSidebarMenu}
          onCloseMobileSidebarMenu={onCloseMobileSidebarMenu}
          onStartMove={onStartMove}
          onActivateSidebarContentItem={onActivateSidebarContentItem}
          onOpenMenu={onOpenMenu}
          onOpenMobileSidebarButtonMenu={onOpenMobileSidebarButtonMenu}
          onOpenSidebarContentItemMenu={onOpenSidebarContentItemMenu}
          onSelectMobileSidebarButton={onSelectMobileSidebarButton}
          onSelectSidebarContentItem={onSelectSidebarContentItem}
          onStartMobileSidebarButtonMove={onStartMobileSidebarButtonMove}
          onStartSidebarContentItemMove={onStartSidebarContentItemMove}
          onStartSidebarContentItemResize={onStartSidebarContentItemResize}
        />
      ))}
    </>
  );
}

function OperationRenderLayer({
  id,
  items,
  selection,
  compositionInfoById,
  showCompositionOverlay,
  menuTarget,
  itemRenderInfoById,
  sourceItemById,
  itemElementMapRef,
  pageTransition,
  showSidebarReservedBoundary,
  mobileSidebarRuntimeState,
  onToggleSidebarReservedBoundary,
  onToggleMobileSidebarMenu,
  onCloseMobileSidebarMenu,
  onStartMove,
  onActivateSidebarContentItem,
  onOpenMenu,
  onOpenMobileSidebarButtonMenu,
  onOpenSidebarContentItemMenu,
  onSelectMobileSidebarButton,
  onSelectSidebarContentItem,
  onStartMobileSidebarButtonMove,
  onStartSidebarContentItemMove,
  onStartSidebarContentItemResize
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`grid-operation-render-layer is-${id}`} aria-label={`${id} operation layer`}>
      {items.map((item) => {
        const renderInfo = itemRenderInfoById.get(String(item.id));
        const operationItem = sourceItemById?.get(String(item.id)) ?? item;
        const mobileMenuOptions = {
          sidebarItemId: item.id,
          viewportMode: renderInfo?.viewportMode
        };
        const mobileMenuOpen = isMobileSidebarMenuOpen(mobileSidebarRuntimeState, mobileMenuOptions);

        return (
          <Fragment key={item.id}>
            <OperationGridItem
              item={item}
              operationItem={operationItem}
              selection={selection}
              compositionInfo={compositionInfoById.get(String(item.id))}
              showCompositionOverlay={showCompositionOverlay}
              isMenuOpen={isAreaOperationMenuTargetForItem(menuTarget, item)}
              renderInfo={renderInfo}
              pageTransitionRole={resolvePageTransitionRole({ item, pageTransition })}
              pageTransition={pageTransition}
              itemElementMapRef={itemElementMapRef}
              showSidebarReservedBoundary={showSidebarReservedBoundary}
              onToggleSidebarReservedBoundary={onToggleSidebarReservedBoundary}
              onStartMove={onStartMove}
              onActivateSidebarContentItem={onActivateSidebarContentItem}
              onOpenMenu={onOpenMenu}
              onOpenSidebarContentItemMenu={onOpenSidebarContentItemMenu}
              onSelectSidebarContentItem={onSelectSidebarContentItem}
              onStartSidebarContentItemMove={onStartSidebarContentItemMove}
              onStartSidebarContentItemResize={onStartSidebarContentItemResize}
            />
            <MobileSidebarMenuButton
              sidebarItem={operationItem}
              presentation={renderInfo?.mobilePresentation}
              renderInfo={renderInfo}
              selection={selection}
              open={mobileMenuOpen}
              itemElementMapRef={itemElementMapRef}
              onSelect={onSelectMobileSidebarButton}
              onOpenMenu={onOpenMobileSidebarButtonMenu}
              onStartMove={onStartMobileSidebarButtonMove}
              onToggle={() => onToggleMobileSidebarMenu?.(mobileMenuOptions)}
            />
            <MobileSidebarMenuPanel
              sidebarItem={operationItem}
              renderInfo={renderInfo}
              open={mobileMenuOpen}
              onActivateItem={onActivateSidebarContentItem}
              onClose={() => onCloseMobileSidebarMenu?.(mobileMenuOptions)}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

function resolvePageTransitionRole({ item, pageTransition }) {
  if (!pageTransition?.active) {
    return null;
  }

  return pageTransition.enterItemIds?.includes(String(item.id)) ? "enter" : null;
}
