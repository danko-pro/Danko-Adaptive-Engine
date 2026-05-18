# Danko Adaptive Engine

Danko Adaptive Engine is an experimental adaptive layout and composition engine with a Vite and React debug surface. The repository keeps core engine logic, adapter layers, runtime resolution, sidebar behavior, and safety checks separated so changes can be reviewed against explicit architecture boundaries.

## Stack

- Vite
- React
- JavaScript ESM

## Project Structure

- `adaptive-engine/` - frozen core adaptive layout engine.
- `engine-adapter/` - command, scene, fitting, selection, and feedback adapters around engine behavior.
- `composition-engine/` - composition planning and behavior profile logic.
- `navigation-engine/` - navigation plan logic.
- `engine-runtime/` - runtime candidate and bridge resolution.
- `sidebar-element/` - sidebar contracts, facade, geometry, layout, render, and diagnostics modules.
- `src/layout/` - React layout canvas integration.
- `src/debug/` - debug probes, operation panels, and local inspection UI.
- `safety-system/` - repository checks, boundary guards, engine freeze checks, and safety dashboard.

## Commands

```sh
npm install
npm run dev
npm run build
npm run check
```

## Architecture Rules

- Do not import engine internals directly across module boundaries.
- Use public facades and exported module entry points.
- Do not change `adaptive-engine/` without an explicit engine unfreeze decision.
- Run `npm run check` before committing changes.
