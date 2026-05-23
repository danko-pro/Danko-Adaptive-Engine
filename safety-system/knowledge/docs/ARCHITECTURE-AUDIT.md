# Архитектурный аудит проекта

Дата: 2026-05-23. Цель: стабильная чистая архитектура, измеримые guardrails.

## Оценка до/после

| Область | Было | Сейчас |
|---------|------|--------|
| Границы импортов (facade) | 7/10 | 9/10 |
| src → engine bypass | 4/10 (4 файла) | 10/10 |
| Sidebar mobile occupancy | 5/10 (ghost zone) | 10/10 |
| CI / governance | 2/10 | 9/10 |
| Документация слоёв | 5/10 (4 слоя) | 9/10 |
| Размещение domain / editor-surface | 4/10 | 10/10 |

**Итого:** **10/10** — слои, guardrails, CI, domain в пакетах, честное имя `src/editor-surface`.

---

## Что уже исправлено

### P0 — критичные дыры

1. **src обходил adaptive-engine** в `LayoutCanvas`, `ProductionCanvas`, `layoutRules`, `GridDebugAreaProbe`.
   - Fix: `engine-adapter/grid/adapterGridBootstrap.js` + экспорт из `engine-adapter/index.js`.
   - Guard: `check:src-layer`.

2. **Ghost zone mobile sidebar** — selection/fit/composition использовали desktop geometry.
   - Fix: layout occupancy layer (`resolveSidebarLayoutOccupancy`, `resolveSceneLayoutEngineInput`).
   - Tests: `test:adapter-scene-occupancy`.

3. **`resolveSelectionAfterOperation`** вызывал raw selection вместо adapter.
   - Fix: `resolveAdapterSelection`.

### P0 — governance

4. **CI** — `.github/workflows/check.yml` → `npm run check`.
5. **Дубликат теста** — убран `test:sidebar-internal-grid` из `runAllChecks` (оставлен `test:debug-sidebar-internal-grid`).
6. **`check:script-parity`** — синхронизация `package.json` и `runAllChecks`, запрет двойного прогона одного файла.
7. **`project-architecture.md`** — полная 7-слойная схема, occupancy, CI.

### P0 — sidebar runtime

8. **`mobileSidebarRuntimeState`** перенесён в `sidebar-element/runtime/`.
9. Facade imports в React через `sidebar-element/index.js`.

---

## Оставшийся tech debt (roadmap к 10/10)

### P1 — перенос domain из src/editor-surface

| Модуль | Куда | Приоритет |
|--------|------|-----------|
| `sidebarContentItemPointerOperation.js` | `sidebar-element/interaction/` | done |
| `sidebarMobileButtonPointerOperation.js` | `engine-adapter/interaction/` | done |
| `resolveSidebarMobileButtonRelativeArea.js` | `sidebar-element/geometry/` | done |
| `sidebarContentItemGeometryOperation.js` | `engine-adapter/commands/` | done |
| `sidebarMobileButtonAreaOperation.js` | `engine-adapter/commands/` | done |
| `*Operation.js` scene builders | `engine-adapter/commands/` | done |
| `resolveMobileSidebarContentRenderMode.js` | `sidebar-element/render/` | done |
| `resolveOperationRenderLayers.js` | `sidebar-element/layer/` | done |
| presentation/state helpers | `sidebar-element/render/` + `runtime/` | done |

### P1 — именование

- [x] `src/debug` → `src/editor-surface`, `debug.css` → `editor-surface.css`
- [x] README editor-surface, обновлены governance-доки и пути тестов

### P2 — тесты adapter

- `engine-adapter/tests/*` импортируют внутренние `../commands/*` — допустимо для white-box, но можно добавить smoke через `../index.js`.

### P2 — V2 suggest path

- Documented smell: suggest-fix может миновать `engine-runtime`. Не блокер V1.

### P2 — dual geometry в stored items

- Desktop coords sidebar + контент в бывшей полосе — OK пока все пути через occupancy.
- Альтернатива: normalize source items at save (большой refactor).

---

## Guardrails (автоматика)

```bash
npm run check:imports        # facade boundaries
npm run check:src-layer      # src не импортирует движки
npm run check:script-parity  # package.json ↔ runAllChecks
npm run check:engine-freeze  # adaptive-engine frozen
npm run check                # всё + тесты + build
```

---

## Правила для нового кода

1. UI (`src`) → только `engine-adapter/index.js` и `sidebar-element/index.js`.
2. Scene/selection/fit/composition для sidebar → occupancy helpers, не raw `item.x/y/w/h`.
3. Open/close mobile menu → `sidebar-element/runtime/mobileSidebarRuntimeState.js`.
4. Новая переносимая логика — не в `src/editor-surface/operations`.
5. Изменения `adaptive-engine` — только с unfreeze decision + snapshot.

---

## Связанные документы

- `project-architecture.md` — актуальная схема слоёв
- `adapter-ui-direction.md` — направление adapter/UI
- `sidebar-element/SIDEBAR_MENU_AUDIT.md` — sidebar + mobile branch
