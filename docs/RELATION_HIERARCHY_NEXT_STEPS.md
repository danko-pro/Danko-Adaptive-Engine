# Relation Hierarchy Next Steps

Checkpoint: `ba9b20c` - `Add relation adaptive position reset action`

## Purpose

This document captures the current state of the relation hierarchy work and the next implementation steps.

The goal is to make parent/child layout relations understandable, controllable, and safe before expanding the system into more advanced adaptive behavior and internal content blocks.

## Current Baseline

The first relation hierarchy cycle is now in place:

- Relation children have formal roles.
- Relation children can be ordered by role, priority, order, and viewport.
- Projection exposes `orderedChildren` metadata.
- Narrow/mobile adaptive stacking uses the ordered relation children.
- Desktop/default behavior remains source-layout first.
- Projection has an explicit strategy contract with default `stack`.
- Relation child move/resize can create `manualAreas.narrow` or `manualAreas.mobile`.
- A clear manual area command can remove a manual adaptive position.
- The debug UI exposes a reset action for returning a relation child to automatic adaptive positioning.

This is enough to start making the system visible to the user without adding more layout behavior yet.

## Core Rule

Desktop and adaptive behavior must stay separate:

- Desktop/default keeps source geometry unless the user edits desktop geometry.
- Narrow/mobile may project relation children through adaptive behavior.
- Manual narrow/mobile positions override automatic adaptive stacking only for that viewport.
- Clearing a manual area returns the child to automatic adaptive stacking.

## What Not To Do Next

Do not immediately add more geometry strategies.

Avoid jumping straight into:

- `flow`
- `grid`
- internal content relations
- drag lines
- automatic role assignment
- large relation settings editors

The current system already changes adaptive behavior. The next risk is user confusion, not missing math.

## Next Step: RELATION-VISUAL-9

The next implementation step should make relations visible in the debug/editor UI.

Human goal:

When a block behaves differently because it is related to another block, the editor should show why.

### Expected UX

If a relation child is selected:

- Its parent should be visually identifiable.
- The menu should show the parent id/name.
- The menu should show the child role/order/priority.
- The menu should show whether the current viewport has a manual area.
- If a manual area exists, the reset action should be visible.

If a parent is selected:

- Its relation children should be visually identifiable.
- The menu should show a compact relation summary.

This should be informational first. Editing role/order/priority should come later.

## Recommended Implementation Split

### RELATION-VISUAL-9A: Pure Relation Debug Info

Add a pure resolver, for example:

`src/editor-surface/operations/resolveLayoutRelationDebugInfo.js`

It should return relation debug state for an item:

```js
{
  isRelationParent: boolean,
  isRelationChild: boolean,
  parentId: string | null,
  childIds: string[],
  role: string | null,
  order: number | null,
  priority: number | null,
  strategy: string | null,
  viewportMode: "default" | "narrow" | "mobile",
  hasManualAreaForViewport: boolean,
  manualArea: { x, y, w, h } | null
}
```

Rules:

- Use existing `normalizeLayoutRelations`.
- Use existing viewport mode resolver.
- Do not duplicate relation normalization logic.
- Do not mutate items.
- Do not touch UI in this step.

Tests should cover:

- parent item
- child item
- unrelated item
- narrow manual area
- mobile manual area
- desktop/default hidden manual state
- internal content relation ignored or marked safely, depending on current relation-tree behavior

### RELATION-VISUAL-9B: Menu Readout

Use the pure debug info in the technical block menu.

Display read-only fields:

- Parent
- Role
- Order
- Priority
- Strategy
- Current viewport
- Manual adaptive position status

Keep the existing reset action.

Do not add editing controls yet.

### RELATION-VISUAL-9C: Canvas Hints

Add subtle editor-only visual hints:

- selected child highlights parent
- selected parent highlights relation children
- small `relation` badge or border accent

Constraints:

- No layout geometry changes.
- No pointer behavior changes.
- No production canvas changes.
- No mobile sidebar changes.
- Keep CSS minimal and scoped to editor surface.

## After Visual Hints

Once the relation system is visible, the next larger steps become safer:

### RELATION-SETTINGS-10

Add controlled editing for:

- role
- order
- priority
- strategy

This should use a dedicated relation settings command, not ad hoc object patching from UI.

### RELATION-STRATEGY-11

Introduce the next projection strategy after `stack`.

Candidate strategies:

- `manual-only`
- `preserve`
- `flow`

Pick only one and define exact behavior before implementation.

### RELATION-INTERNAL-12

Extend relation concepts to internal content blocks only after workspace relations are understandable.

Important:

Internal content blocks must use their own internal grid, not workspace grid geometry.

## Safety Checklist For Every Next Step

Before committing future relation work:

- `npm.cmd run test:layout-relations`
- `npm.cmd run test:layout-relation-projection`
- `npm.cmd run test:layout-relation-manual-area`
- `npm.cmd run test:layout-relation-clear-manual-area`
- `npm.cmd run test:debug-relation-projection`
- `npm.cmd run test:debug-relation-manual-move`
- `npm.cmd run test:debug-relation-manual-resize`
- `npm.cmd run test:debug-relation-clear-manual-area`
- `npm.cmd run check`
- `npm.cmd run build`

## Decision

The next recommended task is:

`RELATION-VISUAL-9A: add pure relation debug info resolver`

Do not add UI in 9A. First make the relation state explicit and testable.
