# MOBILE-SIDEBAR-AUDIT-1

## Files Inspected

- `sidebar-element/adapters/resolveSidebarViewportModeFromMetrics.js`
- `adaptive-engine/modes/resolveGridMode.js`
- `adaptive-engine/modes/gridModeNames.js`
- `adaptive-engine/calculators/grid/calculateGridMetrics.js`
- `sidebar-element/SIDEBAR_VIEWPORT_CALIBRATION.md`
- `sidebar-element/contracts/sidebarElementContract.js`
- `sidebar-element/contracts/sidebarState.js`
- `sidebar-element/contracts/sidebarStatePolicy.js`
- `sidebar-element/render/resolveSidebarRenderModel.js`
- `sidebar-element/layout/resolveSidebarFixedViewportLayout.js`
- `src/editor-surface/operations/resolveOperationRenderLayers.js`
- `src/editor-surface/operations/OperationGridItem.jsx`
- `src/editor-surface/operations/SidebarInternalGrid.jsx`
- `src/layout/LayoutCanvas.jsx`
- `engine-adapter/navigation/resolveSidebarContentNavigationAction.js`
- `engine-adapter/navigation/createSidebarContentFromNavigationPlan.js`

## Current Behavior

### Viewport Mode

Sidebar viewport mode is derived from adaptive grid metrics, not from a direct browser breakpoint.

- `adaptive-engine/calculators/grid/calculateGridMetrics.js` calculates `columns`, `rows`, `cellSize`, and `debug.horizontalMode`.
- `adaptive-engine/modes/resolveGridMode.js` marks the horizontal axis as:
  - `min-limit` when columns reach `minVisibleColumns`;
  - `compact` when columns are below the base minimum but above the visible minimum;
  - `normal` when width is sufficient.
- `sidebar-element/adapters/resolveSidebarViewportModeFromMetrics.js` maps those grid modes into sidebar modes:
  - `horizontalMode: min-limit` -> `mobile`;
  - `horizontalMode: compact`, `mode: compact-width`, or `mode: compact` -> `narrow`;
  - otherwise -> `default`.

Low height alone does not make the sidebar mobile. The existing calibration document explicitly treats mobile as a horizontal limit.

### Sidebar Responsive Contract

`sidebar-element/contracts/sidebarElementContract.js` stores responsive state under `sidebar.responsive`.

Current default responsive state:

- `narrow: collapsed`
- `mobile: collapsed`

The contract currently stores state only. It does not store a mobile render strategy such as `compact-menu-button` or `icon-strip`.

`resolveResponsiveSidebarState` prevents `fixed` from being used as a responsive override. If a responsive override resolves to `fixed`, it falls back to the previous safe state.

### Render Model

`sidebar-element/render/resolveSidebarRenderModel.js` turns sidebar state into render data:

- `fixed` / `overlay` visible states produce `areaMode: expanded`.
- `collapsed` produces `areaMode: collapsed`.
- `hidden` produces `areaMode: hidden`.
- The render model carries `renderArea`, `expandedArea`, `viewportMode`, `viewportLayout`, `state`, `layer`, and `sidebar`.

There is an important special case: if the sidebar state is `fixed`, `resolveResponsiveState` keeps it fixed even in `narrow` or `mobile`. Then `sidebar-element/layout/resolveSidebarFixedViewportLayout.js` turns that fixed sidebar into a top bar:

- `layoutMode: top-bar`
- `renderArea.x: 1`
- `renderArea.y: 1`
- `renderArea.w: metrics.columns`
- `renderArea.h: 1..2` depending on host rows and expanded area height
- dock becomes `top`, while `sourceDock` keeps the original dock

So the system already has a top-bar layout path, but only for fixed sidebars.

### Content Rendering

`src/editor-surface/operations/resolveOperationRenderLayers.js` resolves sidebar render models and stores render info by item id.

`src/editor-surface/operations/OperationGridItem.jsx` renders sidebar content only when:

- `renderInfo.areaMode === "expanded"`
- `renderInfo.sidebar.content.items` exists and is not empty

When those conditions are met, it renders `SidebarInternalGrid` with:

- `content={renderInfo.sidebar.content}`
- `gridArea={renderArea}`
- selection, move, resize, menu, and activation handlers

When the sidebar is collapsed, hidden, or otherwise not expanded, `OperationGridItem` shows the normal label instead of rendering content.

Because fixed sidebars remain `areaMode: expanded` in mobile/narrow top-bar layout, fixed top bars can still render `SidebarInternalGrid`. Responsive-collapsed sidebars cannot.

`src/editor-surface/operations/SidebarInternalGrid.jsx` is currently a debug/editing renderer. It supports:

- internal item rendering;
- button-like classes and states;
- click activation;
- double-click menu;
- keyboard activation;
- internal move/resize;
- hover/pressed/disabled state;
- selected resize handles.

That makes it powerful, but it also means it should not be treated as a pure production/mobile navigation renderer without a clear mode boundary.

### Navigation Action Flow

`engine-adapter/navigation/createSidebarContentFromNavigationPlan.js` generates sidebar navigation content from the navigation plan.

Generated navigation items keep:

- generated `type`;
- generated `action`;
- generated `active` state from `activePageId`;
- editable persisted properties such as geometry, text, style, textFit, disabled, and variant.

`src/layout/LayoutCanvas.jsx` renders the navigation-projected items and receives sidebar content activation from `GridOperationProbeItems`.

Activation flow:

1. `SidebarInternalGrid` receives click or keyboard activation on a content item.
2. The operation probe calls `LayoutCanvas.activateSidebarContentItem`.
3. `engine-adapter/navigation/resolveSidebarContentNavigationAction.js` validates `select-page`.
4. `LayoutCanvas` updates active page/workspace state.
5. Generated sidebar content is rebuilt and the matching navigation item becomes active.

The same content item action contract can be reused by a mobile menu button surface or an icon strip, as long as generated `action` and `navigation` are preserved.

## Architecture Gaps

- There is no explicit mobile content render strategy in the sidebar contract.
- Responsive settings currently choose only sidebar state, not how content should appear inside mobile/narrow UI.
- `collapsed` currently means a collapsed sidebar handle/area, not "top menu button that opens content".
- Runtime open/closed state for a mobile compact menu does not exist.
- There is no pure mobile/top-bar content renderer. `SidebarInternalGrid` is coupled to debug editing behavior.
- There is no icon model for content items. An icon strip would need either a new icon contract or a safe text fallback.
- Current fixed top-bar behavior is layout-oriented, not menu-strategy-oriented.
- Adding a separate mobile sidebar component without using the existing render model risks creating a second sidebar path.

## Option A Plan: Compact Menu Button Mode

Compact menu button mode means mobile/narrow renders a top bar with a small menu button. Clicking it opens the sidebar content.

Recommended architecture:

- Store the selected mobile render strategy in the sidebar contract, not in ad hoc UI state.
- Add a normalized strategy value such as `compact-menu-button`.
- Keep responsive state separate from render strategy:
  - state decides visible/collapsed/hidden behavior;
  - strategy decides how mobile content is presented.
- Add strategy data to `resolveSidebarRenderModel` so downstream renderers do not re-infer it from metrics.
- Keep runtime open/closed state outside the persisted sidebar item. It should be keyed by sidebar id and viewport mode.
- Render the compact button from the existing sidebar render path, not as a second independent sidebar.
- When open, render the existing sidebar content in an overlay/panel anchored to the top bar.
- Reuse the existing navigation action flow for content item activation.
- Do not mutate source geometry when opening or closing the mobile menu.

Suggested stages:

- Add contract/render strategy first without visible UI.
- Add compact button render model next.
- Add runtime open/close only after the render model is test-covered.

Tests needed for Option A:

- strategy normalization defaults to compact menu button;
- render model carries mobile strategy in `mobile` viewport;
- compact button render data is produced only for the correct viewport/state combination;
- open/close state is runtime-only and does not mutate sidebar item data;
- activation of content inside the opened menu still resolves `select-page`;
- disabled content items stay disabled;
- desktop expanded sidebar behavior remains unchanged.

## Option B Plan: Icon Strip Mode

Icon strip mode means mobile/narrow renders the sidebar content directly in the top bar as compact items.

Recommended architecture:

- Store the selected mobile render strategy in the sidebar contract.
- Add a normalized strategy value such as `icon-strip`.
- Reuse existing sidebar content items and their generated navigation actions.
- Preserve generated active state and persisted disabled/variant state.
- Add an explicit presentation resolver for compact mobile items.
- If an item has no icon, use a safe fallback:
  - short text label;
  - first letter;
  - or an overflow/menu button.
- Do not invent icon data implicitly inside navigation action logic.
- Prefer a separate mobile content presentation resolver over modifying `SidebarInternalGrid` into a mixed debug/mobile renderer.

Tests needed for Option B:

- strategy normalization supports icon strip;
- generated navigation actions survive compact projection;
- active item remains active from `activePageId`;
- disabled item remains non-activating;
- fallback presentation is deterministic when no icon exists;
- overflow behavior is deterministic when there are too many items;
- desktop/internal grid editing remains unchanged.

## Recommended First Implementation Step

Start with `MOBILE-SIDEBAR-2A`: add contract/render strategy without UI.

Scope:

- add sidebar mobile render strategy constants;
- normalize the strategy in the sidebar contract;
- expose the resolved strategy from `resolveSidebarRenderModel`;
- add tests for default/narrow/mobile strategy behavior;
- do not render a new button yet;
- do not add icons;
- do not add runtime open/close;
- do not touch grid geometry or pointer logic.

This gives the project a stable language for later UI work without changing behavior. It is the smallest step that reduces ambiguity.

## Risks

- `sidebar-element/render/resolveSidebarRenderModel.js` is high risk because it determines state, layer, area mode, and render area for every sidebar.
- `sidebar-element/layout/resolveSidebarFixedViewportLayout.js` is high risk because it controls fixed sidebar top-bar geometry.
- `src/editor-surface/operations/OperationGridItem.jsx` is high risk because it decides whether content renders, whether pointer movement is blocked, and how double-click menus open.
- `src/editor-surface/operations/SidebarInternalGrid.jsx` is high risk because it combines rendering, activation, menu opening, keyboard behavior, and internal move/resize.
- `src/layout/LayoutCanvas.jsx` is high risk because it owns navigation activation and debug workbench state.
- `engine-adapter/navigation/createSidebarContentFromNavigationPlan.js` is high risk because it generates active/action content and merges editable overrides.
- Accidentally rendering mobile content outside the existing sidebar render model can create a second sidebar instead of extending the current one.
- Accidentally persisting runtime open/closed state into sidebar content can pollute saved layout data.
- Accidentally overwriting generated `action` or `active` can break navigation.
- Accidentally making `collapsed` mean both "collapsed handle" and "opened mobile menu" can make desktop behavior unstable.
- Reusing `SidebarInternalGrid` directly for mobile production rendering can leak debug editing behavior into user-facing mobile UI.

## Tests Needed

- Viewport resolver tests:
  - default from normal width;
  - narrow from compact width;
  - mobile from horizontal min limit;
  - compact height alone does not produce mobile.
- Sidebar contract tests:
  - default mobile render strategy;
  - accepted strategy values;
  - unknown strategy fallback;
  - responsive state behavior remains unchanged.
- Render model tests:
  - fixed sidebar becomes top bar in narrow/mobile;
  - collapsed responsive state still produces collapsed area;
  - render model carries strategy without changing render area;
  - desktop expanded sidebar remains unchanged.
- Operation render layer tests:
  - `renderInfo.renderArea` remains stable;
  - `areaMode` remains stable;
  - content is still available through `renderInfo.sidebar.content`.
- Compact menu tests:
  - menu button render data exists in mobile strategy;
  - open/close state is runtime-only;
  - opened content activates existing navigation actions.
- Icon strip tests:
  - content actions are preserved;
  - active/disabled state is preserved;
  - fallback is used when icon is missing.
- Regression tests:
  - internal sidebar grid geometry stays unchanged;
  - pointer coordinate logic stays unchanged;
  - move/resize stays unchanged;
  - double-click menu stays unchanged;
  - production canvas behavior stays unchanged.

## Proposed Roadmap

### MOBILE-SIDEBAR-2A

Add contract/render strategy without UI.

### MOBILE-SIDEBAR-2B

Add compact menu button render model.

### MOBILE-SIDEBAR-2C

Add runtime open/close for compact menu.

### MOBILE-SIDEBAR-2D

Add icon strip strategy.

### MOBILE-SIDEBAR-2E

Add controls/debug settings.

### MOBILE-SIDEBAR-2F

Add tests and smoke coverage.
