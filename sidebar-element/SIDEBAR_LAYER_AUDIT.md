# Аудит Sidebar / Scene Layer

## Цель

Это карта расчистки sidebar/scene слоя. Красная линия остается прежней:

- не менять `adaptive-engine`;
- не добавлять в `adaptive-engine` знания о sidebar, overlay, hidden, collapsed, UI или render layers;
- правила сцены держать выше замороженного движка.

## Текущий Итог

Архитектурная чистка слоя доведена до baseline-состояния:

```txt
UI / host
  -> engine-adapter public commands
    -> applySceneOperationCommand
      -> engine-adapter/scene handlers
        -> sidebar-element projection / policy
        -> adaptive-engine only for raw layout operations

renderer
  -> sidebar-element scene projection
    -> layout layer
    -> overlay layer
    -> controls/menu/debug layers
```

Главная идея: `adaptive-engine` больше не обучается sidebar. Он видит только тот layout-набор, который подготовил scene layer.

## Границы Слоев

| Слой | Ответственность |
| --- | --- |
| `adaptive-engine` | Замороженная геометрия, операции layout, коллизии, базовая сетка. Ничего не знает про sidebar. |
| `sidebar-element` | Состояния, dock, policy, layer, projection и sidebar facade. |
| `engine-adapter/scene` | Внутренние scene handlers, scope resolution, reflow, scene fitting, merge scoped items. |
| `engine-adapter/commands` | Публичные adapter commands и compatibility wrappers для UI/host. |
| `engine-adapter/fitting` | Чистый fitting core для layout items: geometry, behavior, placement. |
| `src/editor-surface/operations` | Debug UI orchestration, render layers, pointer/keyboard/menu actions. |

## Источники Правды

| Правило | Источник |
| --- | --- |
| Sidebar state semantics | `sidebar-element/contracts/sidebarStatePolicy.js` |
| Layout / overlay / hidden projection | `sidebar-element/layer/createSidebarSceneProjection.js` |
| Scene operation routing | `engine-adapter/commands/applySceneOperationCommand.js` |
| Scene operation handlers | `engine-adapter/scene/*` |
| Layout item fitting | `engine-adapter/fitting/*` |
| Render layer DTO | `src/editor-surface/operations/resolveOperationRenderLayers.js` |

## Что Закрыто

1. [x] `renameAreaCommand` переведен на `applySceneOperationCommand`.
2. [x] `createAreaFromCellCommand` переведен на `applySceneOperationCommand`.
3. [x] `copyAreaCommand` переведен на `applySceneOperationCommand` и scene projection.
4. [x] Legacy `partitionSceneBySidebarLayer` удален.
5. [x] Engine/sidebar operation handling спрятан за scene gateway.
6. [x] `applyEngineOperationCommand` и `applySidebarStateToSceneCommand` убраны из public adapter exports.
7. [x] Sidebar tests объединены вокруг scene gateway.
8. [x] Debug renderer разбит на отдельные components.
9. [x] `useGridOperationProbe` разбит на scene data, keyboard, layout map, composition, pointer и actions hooks.
10. [x] `fitItemsToGridCommand` превращен в тонкую public wrapper-команду.
11. [x] Layout fitting core вынесен и разделен на geometry, behavior и placement helpers.
12. [x] Sidebar re-exports убраны из `engine-adapter/index.js`.
13. [x] Internal scene handlers перенесены в `engine-adapter/scene`.
14. [x] Scope resolution вынесен в `resolveSceneOperationScope`.
15. [x] Sidebar enrichment при create-area перенесен из `createAreaFromCellCommand` в scene handler.
16. [x] Scene fitting вынесен в `fitSceneItemsToGrid`.
17. [x] Merge scoped items вынесен в общий scene helper.
18. [x] Mapping `sidebar -> composition behavior` перенесен из `sidebar-element` в `engine-adapter/composition`.
19. [x] `sidebar-element` больше не импортирует `composition-engine`.
20. [x] `checkImportBoundaries` теперь сканирует `sidebar-element` и `adaptive-engine`.

## Итоговое Состояние

`engine-adapter/commands` больше не содержит внутренних scene handlers. Команды остаются внешним входом.

`engine-adapter/scene` теперь отвечает за:

- выбор layout/overlay scope перед передачей операции в frozen engine;
- применение engine operation к выбранному scope;
- достройку sidebar metadata при создании sidebar через scene gateway;
- смену состояния sidebar и reflow layout items;
- scene-level fitting и обратную сборку полной сцены.

`sidebar-element` остается отдельным доменным слоем. `engine-adapter/index.js` больше не переэкспортирует sidebar internals.

Связь sidebar с composition теперь живет выше, в adapter-слое:

```txt
src/editor-surface
  -> engine-adapter/createContentSchemasFromItems
    -> engine-adapter/composition/createContentSchemasFromItems
      -> sidebar-element public facade
      -> composition-engine public facade
```

Так `sidebar-element` больше не знает о composition-режимах, а UI не собирает sidebar behavior вручную.

## Definition Of Done

- [x] Ни один UI path не вызывает внутренний engine handler напрямую.
- [x] Ни одно scene rule не живет внутри `adaptive-engine`.
- [x] Sidebar state rules не дублируются вне `sidebarStatePolicy`.
- [x] Public adapter API не является фасадом для sidebar internals.
- [x] Scene gateway умеет создавать sidebar без post-create костыля в UI wrapper.
- [x] Полный `npm.cmd run check` должен оставаться зеленым после изменений.

## Следующий Аудит

Архитектурная база готова. Следующая зона - поведение блоков:

- какие типы блоков существуют;
- какие у них роли, приоритеты и минимальные размеры;
- как они двигаются, сжимаются, складываются и конфликтуют;
- где текущее поведение задано явно, а где получается случайно.
