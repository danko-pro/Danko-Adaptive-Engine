import { Fragment } from "react";
import { MobileSidebarMenuButton } from "./MobileSidebarMenuButton.jsx";
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
  onStartMove,
  onActivateSidebarContentItem,
  onOpenMenu,
  onOpenSidebarContentItemMenu,
  onSelectSidebarContentItem,
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
          onStartMove={onStartMove}
          onActivateSidebarContentItem={onActivateSidebarContentItem}
          onOpenMenu={onOpenMenu}
          onOpenSidebarContentItemMenu={onOpenSidebarContentItemMenu}
          onSelectSidebarContentItem={onSelectSidebarContentItem}
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
  onStartMove,
  onActivateSidebarContentItem,
  onOpenMenu,
  onOpenSidebarContentItemMenu,
  onSelectSidebarContentItem,
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
        const mobileMenuOptions = {
          sidebarItemId: item.id,
          viewportMode: renderInfo?.viewportMode
        };

        return (
          <Fragment key={item.id}>
            <OperationGridItem
              item={item}
              operationItem={sourceItemById?.get(String(item.id)) ?? item}
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
              presentation={renderInfo?.mobilePresentation}
              open={isMobileSidebarMenuOpen(mobileSidebarRuntimeState, mobileMenuOptions)}
              onToggle={() => onToggleMobileSidebarMenu?.(mobileMenuOptions)}
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
