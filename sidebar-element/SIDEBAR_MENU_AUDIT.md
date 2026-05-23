# Аудит Меню Сайдбара

## Задача

Зафиксировать, как сейчас устроено меню сайдбара, которое открывается на блоке в рабочей области, и где проходят связи между UI, adapter и `sidebar-element`.

Меню пока рассматриваем как debug/UI-оболочку. Смысл сайдбара, состояния, слой, reserved-зона и reflow не должны жить в меню. Меню должно только показывать доступные действия и отправлять команду в adapter.

## Текущая Цепочка

```text
OperationGridItem
  -> onDoubleClick / Enter
  -> useOperationProbeActions.openItemMenu
  -> GridOperationProbeItems
  -> OperationMenuLayer
  -> ItemActionMenu
  -> SidebarSettingsMenu
  -> useOperationProbeActions.setSidebarState
  -> useOperationProbeActions.setSidebarSettings
  -> engine-adapter.applySceneOperationCommand
  -> SCENE_OPERATION_TYPES.SET_SIDEBAR_SETTINGS
  -> engine-adapter/scene/applySidebarStateSceneOperation
  -> sidebar-element.applySidebarSettingsCommand
```

## Файлы И Роли

| Файл | Роль |
| --- | --- |
| `src/editor-surface/operations/OperationGridItem.jsx` | Рендерит блок на сетке. Открывает меню по double-click и Enter. Для fixed sidebar показывает кнопку включения/выключения protected-line. |
| `src/editor-surface/operations/GridOperationProbeItems.jsx` | Собирает render layers, хранит флаг показа protected-line, находит `menuItem` по `menuTargetId`. |
| `src/editor-surface/operations/OperationMenuLayer.jsx` | Отдельный portal-слой меню поверх всего UI. Считает позицию меню от DOM-элемента блока, ограничивает ее рабочей областью/viewport и запускает drag на capture-фазе слоя. |
| `src/editor-surface/operations/resolveOperationMenuPosition.js` | Pure-helper позиционирования меню: держит меню внутри рабочей области и clamp-ит drag. |
| `src/editor-surface/operations/operationMenuDragIntent.js` | Pure-helper, который решает, имеет ли pointerdown право начать drag меню. Защищает кнопки, inputs и другие интерактивные элементы. |
| `src/editor-surface/operations/ItemActionMenu.jsx` | Общая оболочка меню блока: delete, copy, rename, linked warning/control. Для sidebar добавляет `SidebarSettingsMenu`. |
| `src/editor-surface/operations/SidebarSettingsMenu.jsx` | Специализированный UI настроек sidebar. Сейчас содержит icon-only переключатель `fixed`, смысл включения/выключения живет в tooltip. |
| `src/editor-surface/operations/resolveSidebarFixedToggle.js` | Pure-helper fixed-переключателя: переводит текущие sidebar settings в `active`, `nextState` и tooltip. |
| `src/editor-surface/operations/useOperationProbeActions.js` | Хранит `menuTargetId`, `menuMode`, `renameValue`; переводит действия меню в adapter commands. |
| `src/editor-surface/operations/useOperationProbeKeyboard.js` | Закрывает меню кликом вне меню и Escape; открывает меню выбранного блока по Enter. |
| `engine-adapter/commands/applySceneOperationCommand.js` | Публичный вход adapter для scene operation. |
| `engine-adapter/scene/applySidebarStateSceneOperation.js` | Применяет sidebar settings/state и при входе в fixed запускает согласование layout. |
| `sidebar-element/commands/applySidebarSettingsCommand.js` | Нормализует и применяет доменные настройки sidebar. |

## Что Сейчас Работает

| Область | Статус |
| --- | --- |
| Слой меню | Меню рендерится через portal в `document.body`, имеет высокий `z-index` и не проваливается под блоки. |
| Позиционирование | Меню привязывается к DOM-элементу блока, пересчитывается при resize/scroll и держится в пределах рабочей области. |
| Drag | Меню можно свободно перетаскивать мышью за свободную область панели; drag стартует на portal capture-фазе, не перехватывает кнопки/inputs и clamp-ится внутри рабочей области. |
| Открытие | Реально открывается по double-click на блоке и Enter на выбранном блоке. |
| Закрытие | Закрывается кликом вне `.grid-operation-item-menu`, Escape и кнопкой закрытия. |
| Sidebar action | Иконка fixed переключает `fixed`/`overlay` через `SET_SIDEBAR_SETTINGS` и `engine-adapter`, а не напрямую трогает `sidebar-element`. |
| Фасады | UI импортирует `engine-adapter/index.js` и `sidebar-element/index.js`, не лезет во внутренние файлы слоев. |
| Fixed result | После установки fixed команда проходит через scene gateway, reflow и reserved-zone adapter fitting. |
| Регрессии | Поведение drag-guard и fixed-toggle закреплено тестом `test:debug-menu-interaction`; позиционирование меню закреплено тестом `test:debug-menu-position`. |

## Архитектурные Границы

```text
UI menu
  можно:
    - знать, что выбранный item является sidebar;
    - показывать кнопки и подписи;
    - отправлять settings/state в adapter.

  нельзя:
    - самому менять item.meta.sidebar;
    - самому решать layer/layout/overlay;
    - самому двигать content при fixed;
    - самому считать reserved-zone.

engine-adapter
  можно:
    - принимать scene operation;
    - выбирать handler;
    - запускать sidebar command;
    - запускать fitting/reflow;
    - возвращать report/rejection/selection.

sidebar-element
  можно:
    - нормализовать sidebar contract;
    - знать states/dock/render/reserved policy;
    - отдавать facade-методы наружу.
```

## Найденные Риски

| Риск | Почему важно | Уровень |
| --- | --- | --- |
| `onSetSidebarSettings` протянут в `OperationMenuLayer`, но не используется в `ItemActionMenu` | Сейчас есть только `onSetSidebarState`, но для будущих trigger/animation/responsive controls общий settings-handler уже нужен. | Средний |
| Sidebar menu сейчас содержит только fixed-контрол | Мы намеренно сузили меню для пошаговой работы. Контрол уже умеет включать `fixed` и возвращать sidebar в `overlay`; следующие состояния нужно возвращать не разом, а через доменную матрицу. | Низкий |
| Фактический trigger открытия - double-click, не single click | В разговоре часто звучит "по клику", но код открывает по double-click и Enter. Это нужно согласовать перед изменением UX. | Средний |
| Escape может закрыть меню и очистить selection | `closeByEscape` слушает keydown в capture-фазе и не останавливает событие; ниже есть listener очистки selection по Escape. | Средний |
| Delete активен при открытом меню | Глобальный Delete удаляет выбранный блок, если фокус не в text input. Нужно решить, блокируем ли Delete, пока меню открыто. | Средний |
| Menu UI знает `SIDEBAR_STATES` напрямую | Импорт идет через public facade `sidebar-element/index.js`, это допустимо. Но при росте меню лучше давать UI готовую конфигурацию опций из sidebar facade. | Низкий |
| Нет DOM-тестов меню | Математика позиционирования покрыта pure-тестом, но открытие/закрытие/клавиатура пока не проверяются DOM-регрессиями. | Средний |

## Что Важно Не Сломать Дальше

1. Все действия меню должны идти через `applySceneOperationCommand`.
2. Меню не должно менять `item.meta.sidebar` напрямую.
3. `SidebarSettingsMenu` не должен знать, как fixed влияет на content.
4. Новые кнопки overlay/collapsed/hidden/responsive должны отправлять settings, а не выполнять layout-логику.
5. Если меняем способ открытия меню, нужно явно решить: single click, double-click, context menu или отдельная кнопка на блоке.
6. Если добавляем больше настроек, нужно сначала расширить contract/options в `sidebar-element`, потом UI.

## Ближайший Безопасный Порядок

1. Решить UX открытия: оставить double-click или перейти на отдельную кнопку/одинарный клик.
2. Протащить `onSetSidebarSettings` в `ItemActionMenu` и `SidebarSettingsMenu` как основной handler для будущих настроек.
3. Описать список пунктов меню как данные, а не вручную пришитые кнопки.
4. Вернуть состояния sidebar по одному: `fixed`, потом `overlay`, потом `collapsed`, потом `hidden`.
5. Добавить UI-регрессии на закрытие меню, Escape и protected keyboard behavior.

## Мобильная Ветка (compact menu button)

Мобильный сайдбар разделен на домен и debug UI.

### Домен в `sidebar-element`

| Файл | Роль |
| --- | --- |
| `render/resolveSidebarMobilePresentation.js` | Как показывать сайдбар в mobile: compact-menu-button, icon-strip, none |
| `runtime/mobileSidebarRuntimeState.js` | Чистое состояние open/close меню по ключу `sidebarId:viewportMode` |
| `adapters/resolveSidebarViewportModeFromMetrics.js` | Когда viewport считается mobile/narrow/default |

Публичный вход: `sidebar-element/index.js`.

Тесты runtime: `sidebar-element/tests/mobileSidebarRuntimeStateCases.js` (`npm run test:mobile-sidebar-runtime`).

### Debug UI в `src/editor-surface/operations`

| Файл | Роль |
| --- | --- |
| `mobileSidebarMenuButtonState.js` | Подписи и классы кнопки меню |
| `resolveMobileSidebarContentRenderMode.js` | Какой режим рендера контента в compact shell |
| `MobileSidebarMenuButton.jsx`, `MobileSidebarMenuPanel.jsx` | React-отрисовка |
| `GridOperationProbeItems.jsx` | `useState` для runtime; вызывает `toggle`/`close` из facade |

Тесты presentation UI: `mobileSidebarPresentationCases.js` (`npm run test:mobile-sidebar-presentation`).

### Цепочка open/close

```text
MobileSidebarMenuButton onClick
  -> GridOperationProbeItems.setMobileSidebarRuntimeState
  -> sidebar-element.toggleMobileSidebarMenuOpen / closeMobileSidebarMenu
  -> OperationRenderLayers.isMobileSidebarMenuOpen
  -> MobileSidebarMenuPanel / resolveMobileSidebarContentRenderMode
```

React хранит только snapshot состояния. Правила open/close не дублируются в JSX.

### Сценарии, закрепленные тестами (smoke)

1. Меню закрыто по умолчанию для `sidebar-a:mobile`.
2. Открытие для mobile не открывает narrow автоматически; ключи независимы.
3. `closeMobileSidebarMenu` снимает только один ключ, остальные sidebar/viewport не трогает.
4. `toggle` переключает состояние для пары sidebar + viewport.
5. `closeAllMobileSidebarMenus` сбрасывает все ключи.

### Layout occupancy (fixed top-bar)

На `mobile`/`narrow` fixed sidebar рисуется как top-bar (`renderArea`), но `item.x/y/w/h` в source остаются desktop-зоной.

Adapter использует `engine-adapter/scene/resolveSceneLayoutEngineInput.js` для occupancy, restore source geometry и layout validation.

Публичные входы selection: `resolveAdapterSelection` и `resolveSelectionAfterOperation` (оба через occupancy).

UI-state mobile menu (`open/close`) — `sidebar-element/runtime/mobileSidebarRuntimeState.js`, отдельно от layout occupancy.

### Что переносить дальше (не сделано)

- `mobileSidebarMenuButtonState` и `resolveMobileSidebarContentRenderMode` пока в debug; после стабилизации UX — в `sidebar-element/render` или facade options.
- Жесты (`useSidebarMobileButtonPointerInteraction`) остаются в debug до появления adapter-команд.

## Вывод

Текущая архитектурная линия правильная: меню является UI-слоем, adapter применяет операции, `sidebar-element` хранит смысл sidebar.

Главный долг меню сейчас не в sidebar engine, а в UI-контракте: нужно сделать меню конфигурируемым, явно договориться об открытии и защитить keyboard-поведение, чтобы будущие состояния не вернули хаос.

Runtime open/close мобильного меню перенесен в `sidebar-element`; presentation и жесты пока в debug UI.
