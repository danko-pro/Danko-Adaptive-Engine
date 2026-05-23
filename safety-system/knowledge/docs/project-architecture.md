# Архитектура проекта

Проект — многослойный layout-редактор с замороженным движком, adapter-мостом и тестовым UI-стендом.

## Слои (сверху вниз)

```text
src                    — React UI host (LayoutCanvas, ProductionCanvas)
  editor-surface/      — probes, operation panels, navigation host UI
sidebar-element        — домен sidebar: render model, occupancy, runtime menu state
engine-adapter         — переносимый мост UI → движки (commands, selection, scene)
engine-runtime         — V2 runtime bridge (кандидаты, handoff)
composition-engine     — V2 composition plan / behavior
navigation-engine      — V3 navigation plan
adaptive-engine        — V1 layout-движок (заморожен)
safety-system          — проверки, CI, dashboard, AI-шлюз
```

## Правила импортов

| Слой | Может импортировать |
|------|---------------------|
| `src` | `engine-adapter/index.js`, `sidebar-element/index.js` |
| `engine-adapter` | `adaptive-engine/core/index.js`, `composition-engine/index.js`, `navigation-engine/index.js`, `engine-runtime/index.js`, `sidebar-element/index.js` |
| `sidebar-element` | только внутренние модули и публичный фасад |
| `adaptive-engine` | только себя (без React/DOM) |

Проверяется автоматически:

- `check:imports` — внешние слои не обходят публичные `index.js`
- `check:src-layer` — `src` не импортирует движки напрямую

## Цепочка вызовов UI

```text
src → engine-adapter → adaptive-engine/core/index.js
src → sidebar-element/index.js   (sidebar domain, без обхода adapter для scene ops)
```

Grid bootstrap (создание сессии сетки, правила, processLayoutItems) идёт через `engine-adapter/index.js`, не из `adaptive-engine` напрямую.

## adaptive-engine

Самостоятельный layout-движок. Не знает про React, DOM и конкретный UI.

Принимает: размеры workspace, правила сетки, layout items, operations, constraints, intents.

Возвращает: успех/отказ, diagnostics, report, snapshot.

**Заморожен.** Изменения — отдельное архитектурное решение (`check:engine-freeze`).

## engine-adapter

Переносимый мост между UI и движками. Без React.

Ответственность:

- pointer/cell → selection (`resolveAdapterSelection`)
- scene operations (create, move, copy, fit, rename)
- project scene state (source/projection, visible items)
- navigation host commands и sidebar content actions
- composition plan evaluation (V2 safety)
- **layout occupancy** для fixed sidebar в mobile/narrow режиме

### Layout occupancy (fixed sidebar)

Для fixed sidebar в top-bar режиме stored geometry (desktop x/y/w/h) может не совпадать с визуальной областью.

Правило: все пути selection, fit, composition validation и scene operations используют **occupancy items** через:

- `resolveSceneLayoutOccupancyItems`
- `resolveItemsForLayoutValidation`
- `restoreSidebarSourceAreas`

Фасад: `engine-adapter/scene/resolveSceneLayoutEngineInput.js`.

Occupancy вычисляется в `sidebar-element/interaction/resolveSidebarLayoutOccupancy.js` из render model.

## sidebar-element

Домен sidebar, не привязанный к React:

- render model и internal grid
- layout occupancy для collision/selection
- runtime open/close mobile menu (`runtime/mobileSidebarRuntimeState.js`)

UI в `src/editor-surface` импортирует sidebar через `sidebar-element/index.js`.

## src / editor-surface

`src/layout` — canvas host. `src/editor-surface` — React UI редактора (probes, menus, navigation probe).

Задача: визуально проверять adapter/engine в браузере.

**Не источник архитектурной истины.** Переносимая логика — в `engine-adapter` или `sidebar-element`.

Фасад: `src/editor-surface/index.js`. Domain — через `engine-adapter/index.js` и `sidebar-element/index.js`.

## composition-engine / navigation-engine / engine-runtime

V2/V3 подсистемы. UI не импортирует их напрямую — только через `engine-adapter`.

## safety-system

Инфраструктура проекта:

- границы импортов и слоя `src`
- parity `package.json` ↔ `runAllChecks`
- заморозка движка, V1 guardrails
- полный test suite (`npm run check`)
- GitHub Actions CI (`.github/workflows/check.yml`)
- dashboard и AI-подсказки (patch не применяется автоматически)

## CI

На каждый push/PR в `main`/`master`: `npm ci && npm run check`.
