# Аудит Поведения Блоков

## Цель

Зафиксировать, как сейчас блоки проходят путь от авторской сцены до адаптированной проекции, где уже есть защита, а где поведение еще держится на хрупких договоренностях.

Красная линия: `adaptive-engine` остается замороженным и знает только геометрию сетки. Смысл блоков, слои, sidebar-состояния и адаптация должны проходить через фасады `engine-adapter`, `sidebar-element`, `composition-engine` и `engine-runtime`.

## Текущий Поток

```text
LayoutCanvas
  -> useGridOperationProbe
  -> useOperationProbeComposition
  -> engine-adapter/fitItemsToGridCommand
  -> engine-adapter/scene/fitSceneItemsToGrid
  -> sidebar-element/createSidebarSceneProjection
  -> engine-adapter/fitting
  -> adaptive-engine/core public facade
```

Пользовательские операции идут отдельным путем:

```text
UI pointer/menu/keyboard
  -> engine-adapter/applySceneOperationCommand
  -> resolveSceneOperationScope
  -> adaptive-engine operation или sidebar-element command
  -> result/report/selection
```

## Что Уже Работает

| Зона | Статус |
| --- | --- |
| Source/projection | Временная проекция не сохраняется как авторская сцена. `setItems(..., { projected: true })` показывает результат, но не коммитит его в storage. |
| Source/projection contract | Правило source/projection вынесено в `engine-adapter` и доступно UI только через `engine-adapter/index.js`. |
| Возврат с narrow на desktop | Есть тест, что широкая проекция строится от исходной сцены, а не от последней сжатой версии. |
| Sidebar overlay | Overlay/sidebar не участвует в layout-слое и может пересекаться с content. |
| Sidebar fixed | Fixed/sidebar попадает в layout-слой, а его dock-полоса передается в adapter fitting как reserved-зона. |
| Pointer resize/move | Pointer interaction слушается на document-level, операция строится от стартового состояния drag. |
| Фасады | Полный `check:imports` защищает публичные фасады основных слоев. |
| Ошибки | Scene gateway возвращает известные rejection/error codes для неизвестных операций, sidebar-сбоев и layout projection. |
| Error fallback | Даже ошибка без кода получает стабильный код `ADAPTER_ERROR_CODE_MISSING`, а не безымянную формулировку. |

## Ключевые Файлы

| Файл | Роль |
| --- | --- |
| `src/layout/LayoutCanvas.jsx` | Хранит source-сцену по workspace и применяет source/projection contract из adapter facade. |
| `src/editor-surface/operations/useGridOperationProbe.js` | Держит refs авторской сцены и метрик, отличает projection от user commit. |
| `src/editor-surface/operations/useOperationProbeComposition.js` | Запускает auto-fit/V2 projection при изменении метрик. |
| `engine-adapter/scene/sceneSourceProjectionState.js` | Единый adapter-контракт: visible projection может отображаться, но не обязана коммититься в source. |
| `engine-adapter/scene/resolveSceneOperationScope.js` | Разделяет layout и overlay scope перед передачей в замороженный движок. |
| `engine-adapter/fitting/reservedAreaGeometry.js` | Строит reserved-блоки fixed sidebar и проверяет, что обычные блоки не попали в protected-зону. |
| `engine-adapter/fitting/fitLayoutItemGeometry.js` | Сохраняет привязку к краям по source metrics. |
| `engine-adapter/fitting/placeLayoutItems.js` | Ищет ближайшее свободное место и при необходимости сжимает блок до min size. |
| `composition-engine/behavior/compositionBehaviorProfiles.js` | Описывает смысловые профили блоков: content, sidebar, header, warning, control. |
| `sidebar-element/reserved/resolveSidebarReservedArea.js` | Считает reserved-зону sidebar для визуальной границы. |

## Найденные Риски

| Риск | Почему важно | Текущий уровень |
| --- | --- | --- |
| Два носителя source-сцены | Source хранится в `LayoutCanvas`, а `useGridOperationProbe` держит refs для текущей projection-операции. Контракт commit вынесен в adapter, но refs еще стоит заменить явным source snapshot. | Средний |
| Fixed sidebar reserved-зона еще простая | Adapter уже защищает dock-полосу, но пока это геометрическая полоса без более тонких правил: safe gap, scroll/content-flow, несколько fixed-панелей на одном краю. | Средний |
| Placement не знает смысловых anchors | `placeLayoutItems` ищет ближайшую свободную область по геометрии. Профили дают min size и priority, но не дают строгого правила "верни блок туда, где его оставил пользователь". | Высокий |
| Content может вести себя как обычный прямоугольник | Composition знает профиль `content`, но adapter fitting использует его ограниченно. Главный content еще не имеет отдельной стратегии восстановления. | Средний |
| Projection status считается по visible items | Второй эффект composition оценивает текущие `items`, а они могут быть временной проекцией. Это не ломает source, но может путать диагностику. | Средний |
| Silent browser fallbacks | `localStorage` и pointer capture безопасно падают в fallback, но эти fallback-события не видны в диагностике. Для debug-стенда приемлемо, для ядра поведения не подходит. | Низкий |

## Почему Возникало "Приклеивание"

Главная причина не в одном конкретном блоке. Опасная цепочка такая:

1. Сцена сжимается.
2. `fitLayoutItemGeometry` переносит блоки, которые касались правого/нижнего края source-сетки.
3. Если сжатая проекция случайно становится source-сценой, новый source уже говорит: "блок стоит у края".
4. При расширении fitting честно сохраняет эту новую edge-привязку.
5. Визуально кажется, что блок приклеился и не вернулся.

Сейчас базовая защита от этого уже есть: projected update не коммитится в source. Но архитектурно это пока закреплено на уровне debug UI, а не как единый контракт projection/source в adapter-runtime.

## Тестовое Покрытие

| Сценарий | Где закреплен |
| --- | --- |
| Сужение/расширение edge-bound блоков | `engine-adapter/tests/fitItemsToGridCommandCases.js` |
| Возврат к source после projection | `src/editor-surface/operations/operationProbeSourceStateCases.js` |
| Source/projection adapter contract | `engine-adapter/tests/sceneSourceProjectionStateCases.js` |
| Overlay sidebar не мешает content | `engine-adapter/tests/fitItemsToGridCommandCases.js`, `engine-adapter/tests/sceneOperationGatewayCases.js` |
| Fixed sidebar блокирует пересечение своей области и dock-полосы | `engine-adapter/tests/fitItemsToGridCommandCases.js`, `engine-adapter/tests/sceneOperationGatewayCases.js` |
| Fixed sidebar dock-направления | `engine-adapter/tests/fitItemsToGridCommandCases.js` закрепляет left, right, top, bottom reserved-strip fitting. |
| Pointer операции | `engine-adapter/tests/pointerOperationAdapterCases.js` |
| Sidebar state matrix | `engine-adapter/tests/sidebarStateBehaviorMatrixCases.js` |

Усилено во время аудита:

- `test:layout-map` и `test:adapter-navigation` добавлены в полный `npm run check`, чтобы существующие проверки не выпадали из общего контура безопасности.
- `test:adapter-source-projection` добавлен в полный `npm run check`, чтобы source/projection contract был закреплен на уровне adapter.

## Что Нужно Укрепить Далее

1. Добавить тест: после narrow projection и возврата на desktop content возвращается в пользовательскую source-позицию.
2. Дать `placeLayoutItems` не только min size/priority, но и policy: preserve-user-position, preserve-edge-anchor, preserve-main-content.
3. Разделить diagnostics для source-scene и visible-projection, чтобы статус не путал временное отображение с авторской картой.
4. Заменить refs в debug probe на явный source snapshot, который приходит из adapter/runtime контракта.
5. Описать правила нескольких fixed sidebar на одном или разных краях.

## Вывод

Система уже не "сыпется вся". У нас есть рабочий каркас: фасады, scene gateway, source/projection защита, sidebar layer projection, тесты и полный check.

Первые долги закрыты: source/projection contract больше не живет в debug UI, protected-line fixed sidebar стала реальной reserved-зоной adapter fitting, а left/right/top/bottom dock-направления закреплены тестами. Следующий долг: добавить более смысловые placement policies и диагностику source/projection.
