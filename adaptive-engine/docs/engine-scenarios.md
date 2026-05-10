# Engine Scenarios

Документ фиксирует карту сценариев adaptive-engine.

Цель: заранее описать состояния, ошибки и механики, которые движок должен понимать.
Каждый сценарий должен заканчиваться контролируемым результатом, а не падением приложения.

Статусы:

- `[x]` реализовано и покрыто текущей логикой/тестами;
- `[~]` частично реализовано или есть базовая защита;
- `[ ]` запланировано.

## 1. Workspace Scenarios

Сценарии рабочей области.

- [x] workspace missing
- [x] workspace empty
- [x] workspace tiny
- [x] workspace narrow
- [x] workspace short
- [x] workspace measured
- [x] workspace fractional pixels
- [~] workspace huge
- [ ] workspace devicePixelRatio changes
- [ ] workspace resize burst
- [ ] embedded workspace from host app
- [ ] workspace source without browser observer

Ожидание:

- движок не падает;
- возвращает safe metrics;
- отдаёт `workspaceState`;
- отдаёт warnings;
- фиксирует mode/snapshot.

## 2. Host Integration Scenarios

Сценарии подключения движка внутрь существующего проекта, например калькулятора отделки.

- [x] metrics can be calculated from plain workspace snapshot
- [x] UI can use `createAdaptiveGrid` with observed DOM element
- [ ] engine can receive explicit host workspace object
- [ ] host app can bypass browser observer
- [ ] host app can provide container width/height manually
- [ ] host app can update workspace snapshot after container resize
- [ ] engine can distinguish browser workspace and embedded workspace source
- [ ] diagnostics can report workspace source

Ожидание:

- движок не обязан измерять весь браузер;
- движок может работать от конкретной области внутри host-приложения;
- входные данные контейнера имеют тот же контракт, что и browser snapshot;
- observer остаётся удобным способом, но не единственным источником размеров.

Базовый контракт будущего host input:

```js
{
  width,
  height,
  viewportWidth,
  viewportHeight,
  devicePixelRatio,
  source: "host-container"
}
```

## 3. Grid Rule Scenarios

Сценарии правил сетки.

- [x] rules missing
- [x] rules invalid numbers
- [x] rules negative
- [x] rules min > max
- [x] rules zero cell size
- [x] rules profile candidate disabled
- [ ] rules profile enabled
- [~] rules fallback to base
- [ ] profile missing
- [ ] profile invalid rules

Ожидание:

- rules нормализуются;
- `NaN` не проходит дальше;
- отрицательные и нулевые значения исправляются;
- min/max приводятся к безопасному состоянию;
- resolver объясняет выбор через `rulesMeta`.

## 4. Metrics Scenarios

Сценарии расчёта сетки.

- [x] cell hits minCellSize
- [x] cell hits maxCellSize
- [x] columns hit minVisibleColumns
- [x] columns hit maxColumns
- [x] rows hit minVisibleRows
- [x] rows hit maxRows
- [x] grid smaller than workspace
- [x] grid almost equal workspace
- [x] grid fractional rounding
- [ ] overflow diagnostics
- [ ] scrollbar diagnostics

Ожидание:

- ячейка остаётся квадратной;
- grid size согласован с CSS variables;
- mode отражает реальное состояние;
- расчёт не создаёт неконтролируемый overflow.

## 5. Area Scenarios

Сценарии одной области `{ x, y, w, h }`.

- [x] area valid
- [x] area missing x/y/w/h
- [x] area negative coordinates
- [x] area zero size
- [x] area fractional coordinates
- [x] area outside grid
- [x] area exactly touches right edge
- [x] area exactly touches bottom edge
- [x] area 1x1
- [x] area full grid

Ожидание:

- область нормализуется или получает понятную ошибку;
- координаты остаются grid-based;
- pixel rect считается стабильно;
- правый и нижний край не теряют геометрию.

## 6. Layout Scenarios

Сценарии набора областей.

- [x] layout empty
- [x] layout one item
- [x] layout duplicate ids
- [x] layout missing ids
- [x] layout collision
- [x] layout touching without collision
- [x] layout out of grid
- [~] layout many items
- [x] layout invalid metrics
- [x] layout process failed

Ожидание:

- pipeline не падает;
- ошибки группируются по типам;
- collisions и touching разделяются корректно;
- report показывает total/resolved/errors.

## 7. Operation Scenarios

Сценарии действий над layout items.

- [x] create valid
- [x] create duplicate
- [x] create collision
- [x] create out of grid
- [x] move valid
- [x] move missing target
- [x] move collision
- [x] move out of grid
- [x] resize valid
- [x] resize invalid size
- [x] resize collision
- [x] resize out of grid
- [x] delete valid
- [x] delete missing target
- [x] unknown operation
- [x] operation invalid payload
- [~] operation sequence
- [x] operation rollback
- [ ] operation history
- [ ] operation undo/redo

Ожидание:

- operation не мутирует исходные items;
- valid operation применяет новый layout;
- invalid operation возвращает старые items;
- результат содержит operation report;
- layout-защиты используются повторно, а не дублируются.

## 8. Diagnostics Scenarios

Сценарии самодиагностики.

- [x] snapshot without metrics
- [x] snapshot with layout errors
- [x] snapshot with warnings
- [~] diagnostics ok
- [x] diagnostics warning
- [x] diagnostics error
- [x] unknown warning code
- [x] multiple issues
- [x] diagnostic codes registry
- [x] diagnostic messages registry
- [ ] operation diagnostics report
- [ ] history diagnostics report

Ожидание:

- diagnostics report имеет единый формат;
- severity определяется централизованно;
- unknown code не ломает report;
- original snapshot сохраняется.

## 9. Selection Scenarios

Сценарии выбора по grid cell.

- [x] select empty cell
- [x] select area by cell
- [x] select top-most area on overlap
- [x] select out-of-grid cell
- [x] select invalid cell
- [x] selection invalid metrics
- [x] selection null items
- [ ] selection diagnostics report
- [ ] selection after operation
- [ ] selection after metrics resize

Ожидание:

- selection не слушает DOM;
- UI передаёт уже вычисленную grid cell;
- движок возвращает `area`, `cell` или `empty`;
- out-of-grid и invalid cell не роняют приложение.

## 10. Profile Scenarios

Сценарии профилей правил.

- [x] base selected
- [x] narrow candidate disabled
- [x] short candidate disabled
- [x] tiny candidate disabled
- [ ] narrow enabled
- [ ] short enabled
- [ ] tiny enabled
- [ ] profile missing
- [ ] profile invalid rules
- [~] profile fallback

Ожидание:

- selector безопасно выбирает профиль;
- выключенный candidate не меняет rules;
- плохой профиль не ломает расчёт;
- fallback объясняется через `selectionReason`.

## 11. Stability Scenarios

Сценарии общей устойчивости.

- [~] null input
- [~] undefined input
- [~] wrong arrays
- [~] wrong object shape
- [ ] large layout
- [ ] rapid repeated operations
- [ ] operation after resize
- [ ] operation after profile change
- [ ] metrics changed while operation pending

Ожидание:

- движок возвращает controlled failure;
- контракты результата сохраняются;
- ошибки не прорываются в UI как необработанные exceptions;
- результат можно диагностировать.

## Статус

Эта карта не означает, что все сценарии уже реализованы.
Она задаёт дорожную карту развития adaptive-engine.

Каждый новый сценарий должен проходить путь:

```text
описание
→ тест
→ реализация или защита
→ диагностика
→ документация
```
