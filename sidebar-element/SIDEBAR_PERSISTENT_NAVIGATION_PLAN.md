# Persistent Sidebar Navigation Plan

## Зачем Нужен Документ

Этот документ фиксирует общий план перехода от простого sidebar-блока к постоянному shell-sidebar:

- sidebar сохраняется на всех страницах в одном и том же месте;
- sidebar имеет состояния `fixed`, `overlay`, `collapsed`, `hidden`;
- внутри sidebar появляется собственная внутренняя сетка;
- пункты меню, кнопки и заголовки внутри sidebar являются внутренними блоками;
- нижняя панель вкладок остается технической панелью редактора;
- пользовательская навигация может жить внутри sidebar;
- переходы между страницами в будущем могут анимировать только рабочую область, не двигая sidebar.

## Текущая Картина В Коде

| Область | Где Сейчас Живет | Что Сейчас Делает |
| --- | --- | --- |
| Страницы и workspace | `src/editor-surface/navigation/navigationProbeData.js` | Описывает `layout-page`, `content-page`, `checks-page` и связь page -> workspace. |
| Техническая нижняя панель | `src/editor-surface/navigation/GridNavigationProbe.jsx` | Рендерит вкладки `Раскладка`, `Контент`, `Проверки` поверх рабочей области. |
| Подключение панели | `src/layout/LayoutCanvas.jsx` | Хранит `projectScene`, выводит видимую сцену через projection `shellItems + activeWorkspaceItems`, переключает активный workspace. |
| Project scene | `engine-adapter/project-scene/projectSceneState.js` | Разделяет persistent shell-items и workspace-items, мигрирует legacy storage и собирает видимую сцену. |
| Scene source/projection | `engine-adapter/scene/sceneSourceProjectionState.js` | Разделяет source-коммит и projection-обновления. |
| Sidebar contract | `sidebar-element/contracts/sidebarElementContract.js` | Нормализует `state`, `dock`, `expandedArea`, `collapsedSize`, `trigger`, `animation`, `responsive`. |
| Sidebar state policy | `sidebar-element/contracts/sidebarStatePolicy.js` | Определяет, какие состояния влияют на layout и reserved-zone. |
| Sidebar render model | `sidebar-element/render/resolveSidebarRenderModel.js` | Решает, как sidebar отображается в зависимости от state и viewport mode. |
| Sidebar reserved-zone | `sidebar-element/reserved/resolveSidebarReservedArea.js` | Считает область, которую fixed-sidebar резервирует в рабочей сетке. |
| Navigation engine | `navigation-engine/*` | Знает страницы, маршруты, workspaces, navigation items, shell reserved area. |

## Главная Модель

Sidebar должен стать не обычным блоком конкретной страницы, а persistent shell-элементом.

```txt
shell scene
  sidebar
    internal sidebar grid
      navigation item blocks
      button blocks
      title blocks

workspace scenes
  layout-workspace blocks
  content-workspace blocks
  checks-workspace blocks
```

Смена страницы меняет только активную workspace-сцену. Sidebar при этом остается тем же самым объектом.

## Важное Разделение

Нижняя панель вкладок не удаляется.

Она становится технической панелью режима редактирования:

- переключение страниц в редакторе;
- добавление страниц через `+`;
- показ статуса V3/navigation-engine;
- fallback-навигация, если пользовательская навигация в sidebar еще не настроена;
- техническое управление страницами и workspace.

Sidebar-навигация - это пользовательская/проектная навигация. Она должна быть редактируемой как часть проекта.

```txt
bottom editor panel
  technical editor navigation

sidebar internal content
  user/project navigation
```

## Красные Линии

1. `adaptive-engine` не получает знания о sidebar, pages, navigation или internal sidebar grid.
2. Workspace-блоки и внутренние sidebar-блоки не смешиваются в одном списке.
3. Sidebar settings не меняются напрямую из UI через `item.meta.sidebar`.
4. Все изменения сцены идут через public facade/adapter commands.
5. `navigation-engine` не импортирует React, CSS и debug UI.
6. `sidebar-element` не должен знать, как React рисует кнопки.
7. Нижняя техническая панель не должна становиться источником пользовательской навигации сайта.

## Целевая Структура Данных

Первый уровень: разделение shell и workspace items.

```js
{
  shellItems: [
    {
      id: "main-sidebar",
      x: 1,
      y: 1,
      w: 5,
      h: 24,
      meta: {
        blockType: "sidebar",
        sidebar: {
          state: "fixed",
          dock: "left"
        }
      }
    }
  ],
  workspaceItemsById: {
    "layout-workspace": [],
    "content-workspace": [],
    "checks-workspace": []
  }
}
```

Второй уровень: внутреннее содержимое sidebar.

```js
{
  meta: {
    blockType: "sidebar",
    sidebar: {
      state: "fixed",
      dock: "left",
      content: {
        grid: {
          columns: 4,
          rows: 20
        },
        items: [
          {
            id: "nav-layout",
            type: "navigation-item",
            x: 1,
            y: 1,
            w: 4,
            h: 1,
            text: "Раскладка",
            action: {
              type: "select-page",
              pageId: "layout-page"
            },
            style: {
              fontSize: 14,
              fontWeight: 700,
              align: "center"
            },
            textFit: "wrap"
          }
        ]
      }
    }
  }
}
```

## Внутренние Блоки Sidebar

Внутренние элементы sidebar - это не просто HTML-кнопки. Это блоки внутренней сетки sidebar.

Минимальный контракт внутреннего блока:

| Поле | Смысл |
| --- | --- |
| `id` | Уникальный id внутри sidebar content. |
| `type` | `navigation-item`, `button`, `title`, позже другие типы. |
| `x`, `y`, `w`, `h` | Координаты во внутренней сетке sidebar. |
| `text` | Текст внутри блока. |
| `action` | Что делает блок при клике. |
| `style` | Настройки текста и визуала. |
| `textFit` | Поведение текста внутри контейнера. |

Начальные правила текста:

- `wrap` - переносить текст по строкам по умолчанию;
- `shrink` - позже уменьшать шрифт до безопасного минимума;
- `request-resize` - позже диагностировать, что sidebar слишком узкий;
- `truncate` - возможно позже, если понадобится.

## Связка Navigation -> Sidebar

`navigation-engine` остается источником страниц, routes, activeWorkspace и navigation items.

Sidebar получает отображение через adapter:

```txt
navigation-engine plan
  -> navigation items
    -> sidebar navigation content adapter
      -> sidebar.content.items
```

Это значит:

- navigation-engine не знает про sidebar internal grid;
- sidebar-element не решает, какие страницы существуют;
- adapter превращает страницы в внутренние блоки sidebar;
- debug/editor UI только рисует готовую модель.

## Page Transition

Анимация перехода страниц остается будущим слоем.

Идея:

- sidebar остается на месте;
- рабочая область меняет содержимое с анимацией;
- переход не должен менять source-сцену сам по себе;
- transition должен жить рядом с navigation/page host, а не внутри sidebar state policy.

Возможный будущий контракт:

```js
navigation: {
  transition: {
    type: "slide",
    duration: 240,
    direction: "auto"
  }
}
```

или на уровне страницы:

```js
page: {
  id: "content-page",
  transition: {
    enter: "slide-left",
    exit: "fade"
  }
}
```

## План По Шагам

### Шаг 0. Зафиксировать Документ

- [x] Описать цель persistent sidebar.
- [x] Зафиксировать роль нижней панели как editor-panel.
- [x] Зафиксировать разделение shell scene и workspace scenes.
- [x] Зафиксировать будущий контракт `sidebar.content`.
- [x] Зафиксировать page transition как будущий слой.

### Шаг 0.1. Подготовка После Shell Split

- [x] Зафиксировать, что этапы A/B/C уже выполнены.
- [x] Зафиксировать, что sidebar теперь живет в `shellItems`, а не в конкретном workspace.
- [x] Зафиксировать, что следующий рабочий участок - `sidebar.content`.
- [x] Зафиксировать правило: сначала контракт и тесты, потом adapter navigation -> sidebar, потом UI-render.

### Шаг 1. Аудит Текущей Цепочки

- [x] Проверить `LayoutCanvas`: `activePageId`, `activeWorkspaceId`, `projectScene`.
- [x] Проверить storage: сейчас сохраняется project scene snapshot v2.
- [x] Проверить, где sidebar сейчас попадает в `shellItems`.
- [x] Проверить, какие тесты уже защищают source/projection.
- [x] Зафиксировать текущую схему перед разделением shell/workspace.

#### Результат Аудита Шага 1

Актуальная цепочка host/debug после этапов A/B/C устроена так:

```txt
activePageId
  -> getWorkspaceIdByPageId(activePageId)
    -> activeWorkspaceId
      -> projectScene
        -> shellItems
        -> workspaceItemsById[activeWorkspaceId]
        -> resolveVisibleProjectSceneItems
        -> debugOperationItems
          -> useGridOperationProbe
            -> GridOperationProbeItems
```

`LayoutCanvas` сейчас хранит:

- `activePageId` - выбранная страница нижней технической панели;
- `activeWorkspaceId` - вычисляется из `activePageId`;
- `projectScene` - source-состояние проекта: `shellItems` и `workspaceItemsById`;
- `debugOperationItems` - видимая projection-сцена: `shellItems + activeWorkspaceItems`;
- `operationPanelCollapsed` - состояние верхней debug-панели.

При пользовательской операции `updateDebugOperationItems` вызывает `resolveSceneItemsUpdate`. Если обновление является source-операцией, результат проходит через `resolveProjectSceneWithVisibleItems` и раскладывается обратно по source-слоям:

```txt
visible scene
  -> shell items по policy `isNavigationProbeShellItem`
  -> active workspace items
```

Projection-обновления показываются в UI, но не коммитятся как source.

При смене страницы:

```txt
selectNavigationPage
  -> setProjectScene
  -> activePageId меняется
  -> activeWorkspaceId меняется
  -> shell policy применяется повторно
  -> selection очищается
  -> debugOperationItems заменяется на shellItems + activeWorkspaceItems
```

Сейчас `shellItems` уже есть. Любой sidebar, который проходит policy `isNavigationProbeShellItem`, считается persistent shell item.

Фактические места sidebar сейчас:

- `layout-workspace` стартует с `initialOperationProbeItems` и не содержит sidebar по умолчанию;
- legacy `sidebar-a`, если встречается в workspace, переносится в `shellItems`;
- пользовательский sidebar после source-коммита остается persistent shell item;
- при переключении страницы sidebar не исчезает и не дублируется между workspaces.

Storage сейчас использует snapshot v2:

```txt
localStorage["adaptive-engine:operation-probe-project-scene:v2"]
  -> activePageId
  -> activeWorkspaceId
  -> shellItems
  -> workspaceItemsById
```

Это значит:

- сохраняются shell-сцена и workspace-сцены;
- старый v1 storage с массивом items мигрирует в v2 snapshot;
- sidebar policy применяется при загрузке, смене страницы и source-коммите;
- source/projection остаются разделены.

Navigation сейчас считается, но не управляет физическим sidebar:

```txt
createNavigationHostState
  pages/routes/workspaces
  navigationProbeConfig
  shell.reservedArea = { left: 0, right: 0, top: 0, bottom: 0 }
  usableWorkspace = full grid
```

Нижняя панель `GridNavigationProbe` рендерится отдельно поверх рабочей области. Она остается технической editor-panel и не должна становиться пользовательской sidebar-навигацией.

Существующая защита тестами:

| Тест | Что Защищает | Чего Еще Не Защищает |
| --- | --- | --- |
| `engine-adapter/tests/projectSceneStateCases.js` | Project scene: `shellItems + activeWorkspaceItems`, scope операций, conflicts, storage snapshot v2. | Не проверяет внутреннюю sidebar-сетку. |
| `src/editor-surface/navigation/navigationProbeProjectSceneCases.js` | Debug policy: sidebar переносится в shell, удаляется из workspace и остается видимым на другой странице. | Не проверяет `sidebar.content`. |
| `engine-adapter/tests/sceneSourceProjectionStateCases.js` | Source/projection update contract и `resolveStoredSceneSourceItems`. | Не проверяет внутреннюю sidebar-сетку. |
| `src/editor-surface/operations/operationProbeSourceStateCases.js` | Projection не коммитит source; fixed-sidebar восстанавливается из source. | Не проверяет persistent sidebar content. |
| `engine-adapter/tests/navigationHostStateCases.js` | active page -> route -> workspace, fallback active page. | Нет связи navigation -> sidebar content. |
| `engine-adapter/tests/sidebarStateBehaviorMatrixCases.js` | Поведение `fixed`, `overlay`, `collapsed`, `hidden` в scene operations. | Не проверяет внутренние navigation blocks. |
| `src/editor-surface/operations/resolveOperationRenderLayersCases.js` | Render layers sidebar/layout/overlay. | Не проверяет внутреннюю sidebar-сетку. |

Вывод после этапов A/B/C:

```txt
сделано:
  visible scene = shellItems + activeWorkspaceItems

следующее:
  sidebar.content = внутренние блоки persistent sidebar
```

Следующий шаг нельзя делать как HTML-кнопки внутри JSX. Нужны явные решения:

- где хранится `sidebar.content`;
- как нормализуются внутренние sidebar items;
- как navigation projection превращается во внутренние sidebar blocks;
- как UI рисует готовую модель, не создавая смысл напрямую;
- как не смешать внешний drag sidebar и будущий внутренний drag sidebar items.

### Шаг 2. Ввести Shell Items

- [x] Добавить host/debug состояние `shellItems`.
- [x] Перенести persistent sidebar из workspace items в `shellItems`.
- [x] Не менять пока внутреннюю структуру sidebar.
- [x] Проверить, что sidebar не исчезает при смене страниц.
- [x] Проверить, что sidebar не дублируется между workspace.

### Шаг 3. Подключить Shell Sidebar К Scene Projection

- [x] Собирать видимую сцену из `shellItems + activeWorkspaceItems`.
- [x] Сохранять `shellItems` отдельно от `workspaceItemsById`.
- [x] Убедиться, что fixed sidebar продолжает резервировать место.
- [x] Убедиться, что обычные workspace blocks сохраняются по своим workspace.
- [x] Закрепить тестами source/projection поведение shell + active workspace.

### Шаг 4. Расширить Sidebar Contract

Ближайший рабочий шаг после подготовки. Здесь еще не меняем UI: только доменный контракт, фасады и тесты.

- [x] Добавить `sidebar.content` в `normalizeSidebarElementContract`.
- [x] Добавить нормализацию внутренней сетки.
- [x] Добавить нормализацию внутренних items.
- [x] Добавить facade exports только через `sidebar-element/index.js`.
- [x] Закрепить тестами `sidebarElementFacadeCases`.

Базовая реализация шага 4:

| Файл | Роль |
| --- | --- |
| `sidebar-element/contracts/sidebarContent.js` | Pure contract для внутренней сетки sidebar: grid, items, action, style, textFit. |
| `sidebar-element/contracts/sidebarElementContract.js` | Поднимает версию контракта и включает `content` в общую нормализацию sidebar. |
| `sidebar-element/index.js` | Экспортирует content-контракт только через публичный фасад слоя. |
| `sidebar-element/tests/sidebarElementFacadeCases.js` | Проверяет default content, нормализацию плохих данных, сохранение content при смене state. |

### Шаг 5. Adapter Navigation -> Sidebar Content

- [x] Описать pure-helper, который превращает pages/navigation items во внутренние sidebar items.
- [x] Не писать в sidebar напрямую из navigation-engine.
- [x] Добавить диагностику нехватки места во внутренней сетке.
- [x] Закрепить тестом mapping pages -> sidebar content items.

Базовая реализация шага 5:

| Файл | Роль |
| --- | --- |
| `engine-adapter/navigation/createSidebarContentFromNavigationPlan.js` | Pure adapter: берет `navigationPlan.projection.projections` и возвращает `sidebar.content` с внутренними navigation-item блоками. |
| `engine-adapter/tests/navigationSidebarContentCases.js` | Проверяет mapping, active page, `select-page` action и диагностику overflow внутренней сетки. |
| `engine-adapter/index.js` | Экспортирует adapter только через публичный фасад `engine-adapter`. |

### Шаг 6. Render Internal Sidebar Grid

- [x] Нарисовать внутреннюю сетку внутри sidebar-блока.
- [x] Отрисовать navigation items как внутренние блоки.
- [x] Сделать active page state визуальным состоянием внутреннего navigation-item.
- [x] Не смешивать внутренний drag с внешним drag sidebar.

Базовая реализация шага 6:

| Файл | Роль |
| --- | --- |
| `engine-adapter/navigation/createSidebarContentFromNavigationPlan.js` | Добавляет projection-helper, который вкладывает navigation content в sidebar item для render-сцены. |
| `src/layout/LayoutCanvas.jsx` | Передает в render слой enriched projection-items, не меняя source-items операций. |
| `src/editor-surface/operations/SidebarInternalGrid.jsx` | Read-only отрисовка внутренней sidebar-сетки и navigation-item блоков. |
| `src/editor-surface/operations/OperationGridItem.jsx` | Рисует internal grid для expanded sidebar и сохраняет внешний item как хозяина drag/menu. |
| `src/editor-surface/operations/GridOperationProbeItems.jsx` | Разделяет source items для операций и render items для отображения. |
| `src/editor-surface/debug.css` | Стили внутренней sidebar-сетки, active state и text-fit отображения. |

### Шаг 7. Editor Panel Для Страниц

- [x] Оставить нижнюю панель как техническую.
- [x] Добавить `+` для создания страницы.
- [x] Создание страницы должно добавлять page, route, workspace и пустую workspace scene.
- [x] Sidebar-навигация может обновляться через adapter, но не вручную из нижней панели.

Базовая реализация шага 7:

| Файл | Роль |
| --- | --- |
| `engine-adapter/navigation/createNavigationPageCommand.js` | Pure command создания связки `page + route + workspace`. |
| `engine-adapter/tests/navigationPageCommandCases.js` | Проверяет создание страницы, активный page/workspace и защиту от id-collisions. |
| `src/editor-surface/navigation/navigationProbeStorage.js` | Сохраняет editor navigation model для debug-host. |
| `src/editor-surface/navigation/GridNavigationProbe.jsx` | Нижняя техническая панель получила кнопку `+`. |
| `src/layout/LayoutCanvas.jsx` | Хранит navigation model, применяет command и добавляет пустую workspace scene. |

### Шаг 8. Редактирование Внутренних Блоков Sidebar

Цель шага: превратить read-only внутреннюю сетку sidebar в управляемые внутренние блоки, не смешивая их с обычными workspace-блоками и не ломая внешний drag/menu самого sidebar.

Текущая render-цепочка:

```txt
navigation model
  -> createSidebarContentFromNavigationPlan
    -> resolveItemsWithSidebarNavigationContent
      -> LayoutCanvas debugRenderItems
        -> GridOperationProbeItems renderItems
          -> resolveOperationRenderLayers
            -> OperationGridItem
              -> SidebarInternalGrid
```

Текущая action-цепочка внешнего sidebar:

```txt
OperationGridItem
  -> useOperationProbeActions
    -> applySceneOperationCommand
      -> SET_SIDEBAR_SETTINGS
        -> applySidebarStateSceneOperation
          -> applySidebarSettingsCommand
```

Будущая action-цепочка внутренних sidebar-блоков должна идти так же через фасады:

```txt
SidebarInternalGrid user action
  -> debug action hook
    -> applySceneOperationCommand
      -> sidebar content scene operation
        -> sidebar-element content command
          -> source commit в shell sidebar item
```

Красные линии шага 8:

1. Внутренние sidebar-блоки не становятся обычными workspace-items.
2. Внутренний selection должен быть отдельным от внешнего selection блока sidebar.
3. Клик/drag внутри sidebar content не должен запускать внешний drag sidebar-блока.
4. Запись `sidebar.content` не должна идти напрямую из React через `item.meta.sidebar`.
5. Все изменения идут через `engine-adapter/index.js` и public scene operation.
6. `sidebar-element` остается владельцем контракта и нормализации content.
7. Render-projection из navigation не должна случайно коммититься как source.
8. Active page state может оставаться render-projection, пока мы явно не введем пользовательское редактирование навигации.
9. Редактирование внутренних кнопок sidebar должно жить в том же всплывающем menu-layer, а не в отдельной несвязанной панели.

#### Дополнительный План Шага 8

Этот план уточняет порядок внедрения редактируемых внутренних блоков sidebar. Нумерация начинается с шага 0, потому что сначала фиксируем знания и границы, а только потом меняем поведение.

| Шаг | Название | Результат | Статус |
| --- | --- | --- | --- |
| 0 | Документирование | Зафиксированы render/source/selection/menu/command цепочки, зависимости и красные линии. | done |
| 1 | Internal Target Model | Появляется единая модель цели меню: внешний блок или внутренний sidebar item. | done |
| 2 | Internal Selection | Внутренний блок sidebar можно выбрать отдельно от внешнего sidebar-блока. | done |
| 3 | Event Boundary | Клики по внутренним кнопкам не запускают внешний drag/resize sidebar. | done |
| 4 | Unified Popup Anchor | Общее всплывающее меню умеет открываться от внутреннего sidebar item и оставаться draggable/clamped. | done |
| 5 | Sidebar Content Command Contract | Появляется scene operation для изменения `sidebar.content` через фасад. | done |
| 6 | Text Editing | В том же popup menu можно менять название/текст внутренней кнопки. | done |
| 7 | Basic Style Editing | Через popup menu можно менять базовый стиль: font size, weight, align. | done |
| 8 | Visual Style Expansion | Постепенно добавляются контур, толщина, цвет, фон, цвет текста, прозрачность. | in progress |
| 9 | Text Fit Diagnostics | Закрепляется `wrap`, позже добавляются `shrink` и `request-resize` с понятной диагностикой. | planned |
| 10 | Stable Internal Grid Size | Внешний resize sidebar не сжимает внутренние кнопки; sidebar нельзя сжать меньше внутреннего контента. | done |
| 11 | Internal Move/Resize | Внутренние элементы можно двигать/менять внутри sidebar content grid без влияния на workspace layout. | in progress |

#### Шаг 8.0. Зафиксировать Зависимости

- [x] Прочитать render-цепочку `navigation -> sidebar.content -> SidebarInternalGrid`.
- [x] Прочитать action-цепочку внешнего sidebar menu/state.
- [x] Зафиксировать, что сейчас internal sidebar items только отображаются.
- [x] Зафиксировать, что клики/drag внутри sidebar content пока намеренно отсутствуют.

#### Шаг 8.1. Internal Target Model

- [x] Ввести pure target model для operation menu.
- [x] Поддержать target внешнего блока: `area-item + itemId`.
- [x] Поддержать будущий target внутреннего sidebar item: `sidebar-content-item + sidebarItemId + contentItemId`.
- [x] Перевести существующее popup menu на `menuTarget`, не меняя внешний UX.
- [x] Оставить anchor текущего меню на внешнем DOM-блоке до шага Unified Popup Anchor.

#### Шаг 8.2. Internal Selection

- [x] Ввести отдельную модель выбора внутреннего блока: `sidebarItemId + contentItemId`.
- [x] Не использовать `SELECTION_TYPES.AREA` для внутренних sidebar items.
- [x] Подсвечивать выбранный внутренний item внутри `SidebarInternalGrid`.
- [x] Останавливать pointer events внутренних items, чтобы внешний sidebar не начинал move/resize.
- [x] Показывать внутренний выбор в информационной строке debug-панели.
- [x] Закрепить pure-тестом, что internal selection не считается выбранным внешним area item.

#### Шаг 8.3. Unified Popup Menu Для Internal Items

Сначала закрыта event-boundary часть:

- [x] Вынести явный boundary-helper для событий внутреннего sidebar content.
- [x] Pointer/click/double-click внутренних items не пробрасываются во внешний `OperationGridItem`.
- [x] Левый pointer выбирает внутренний item, но не запускает внешний drag sidebar.
- [x] Вторичный pointer гасится, но не выбирает внутренний item.
- [x] `Enter` и `Space` выбирают внутренний item, не открывая внешнее меню sidebar.
- [x] `Escape` остается доступным глобальному keyboard-layer для очистки выбора.

Дальше - popup-menu часть:

- [x] Использовать существующий всплывающий слой меню для внешних блоков и внутренних sidebar-блоков.
- [x] Добавить режим меню для внутреннего sidebar item: `sidebarItemId + contentItemId`.
- [x] Открывать popup от DOM-якоря внутренней кнопки, а не от внешнего sidebar-блока.
- [x] Для internal target показывать безопасное меню без destructive-действий внешнего блока.
- [x] В этом же меню редактировать название/текст внутренней кнопки.
- [x] В этом же меню редактировать базовые визуальные свойства: цвет текста и фон.
- [x] В этом же меню редактировать контур и толщину контура.
- [x] В этом же меню редактировать прозрачность текста и фона отдельно.
- [ ] Не добавлять все свойства разом: каждое новое свойство сначала проходит contract -> command/facade -> test -> UI.
- [x] Меню должно оставаться draggable/clamped так же, как текущее меню блока.

#### Шаг 8.4. Sidebar Content Commands

- [x] Добавить scene operation для изменения одного внутреннего content item.
- [x] Зафиксировать, что scene operation для content grid откладывается до реальной необходимости.
- [x] Прокинуть операции только через `applySceneOperationCommand`.
- [x] Внутри adapter вызывать команду/нормализацию из `sidebar-element`, а не менять nested object вручную.
- [x] Закрепить тестами: invalid sidebar, invalid content item, normalization, source commit в scene items.

#### Шаг 8.5. Text Editing

- [x] Редактировать текст через textarea-окно в том же popup menu внутренней кнопки.
- [x] Коммитить изменение текста через sidebar content command.
- [x] Отменять ввод без изменения source.
- [x] Не ломать горячие клавиши внешнего меню, Delete и Escape.
- [x] Ввод текста живет в карточке внутреннего элемента, а не в отдельной плавающей форме.
- [x] `Shift+Enter` добавляет ручной перенос строки; обычный `Enter` сохраняет текст.
- [x] Текстовое окно popup показывает те же `fontSize`, `fontWeight` и `align`, что и внутренняя кнопка sidebar.

#### Шаг 8.6. Style Editing

- [x] Настраивать font size.
- [x] Настраивать font weight.
- [x] Настраивать align.
- [x] Все style-изменения пропускать через нормализацию `sidebar-element`.
- [x] Расширить visual-style первым безопасным шагом: `textColor`, `backgroundColor`.
- [x] Нормализовать цвета в `sidebar-element` как безопасный hex `#rrggbb`.
- [x] Прокинуть цвета через scene operation и render внутренней кнопки sidebar.
- [x] Расширить visual-style вторым безопасным шагом: `borderColor`, `borderWidth`.
- [x] Ограничить `borderWidth` безопасным диапазоном `0..8`.
- [x] Расширить visual-style третьим безопасным шагом: `textOpacity`, `backgroundOpacity`.
- [x] Ограничить `textOpacity` и `backgroundOpacity` безопасным диапазоном `0.1..1`.
- [x] Редактировать прозрачность через компактный ручной ввод процентов без нативных spinner-стрелок.

#### Шаг 8.7. Text Fit

- [x] Закрепить `textFit: wrap` как базовое поведение.
- [x] Не показывать отдельные кнопки переноса/обрезки в popup: ручной перенос делается через `Shift+Enter`.
- [x] Добавить pure helper диагностики переполнения текста без изменения source-сцены.
- [x] Экспортировать диагностику через публичный фасад `sidebar-element`.
- [x] Показывать предупреждение о переполнении мягким toast-сообщением на 4 секунды по центру экрана.
- [ ] Позже добавить `shrink`.
- [ ] Позже добавить `request-resize`.
- [ ] Для `request-resize` возвращать понятную диагностику, а не неизвестную ошибку.

#### Шаг 8.8. Stable Internal Grid Size

- [x] Внутренние строки sidebar content имеют стабильную высоту от grid cell size.
- [x] Изменение внешней высоты sidebar не сжимает внутренние кнопки.
- [x] Sidebar получает защиту минимального размера по фактическим внутренним items.
- [x] Внутренний content не получает отдельную прокрутку: высота sidebar редактируется вручную, но не ниже контента.
- [ ] Позже отдельно описать runtime-поведение clip для опубликованного сайта.

#### Шаг 8.9. Internal Move/Resize

- [x] Добавить geometry-operation для внутренних items через существующий `SET_SIDEBAR_CONTENT_ITEM`.
- [x] Разрешить компактное ручное изменение `x/y/w/h` в popup menu внутренней кнопки.
- [x] Проверять коллизии только внутри sidebar content grid при изменении `x/y/w/h`.
- [x] Возвращать известную ошибку `SIDEBAR_CONTENT_ITEM_COLLISION` вместо неизвестной ошибки при наложении внутренних кнопок.
- [x] Не трогать workspace layout при ручном изменении геометрии внутренних sidebar items.
- [x] Отдельно спроектировать drag внутренних sidebar items.
- [x] Внутренние кнопки можно перетаскивать как блоки внутри sidebar.
- [x] Внутренние кнопки можно растягивать resize-ручками как обычные блоки.
- [x] Drag внутренней кнопки может вернуть ее в стартовую ячейку в рамках того же зажатия.
- [x] Не смешивать internal drag с внешним drag sidebar.
- [x] Отвязать внутреннюю сетку от растягивания по боковым границам sidebar: колонки фиксируются по `cell-size`.
- [ ] Внешний resize sidebar не должен менять координаты и размеры внутренних items.

### Шаг 9. Page Transitions

- [x] Отдельно описать transition contract.
- [x] Сделать переход только для рабочей области.
- [x] Sidebar не должен участвовать в transition.
- [x] Не смешивать transition с source scene update.
- [x] Подключить переходы workspace к внутренним кнопкам меню sidebar.

#### Аудит Цепочки Шага 9

Текущая цепочка переключения страницы:

```txt
GridNavigationProbe
  -> onSelectPage(pageId)
    -> LayoutCanvas.selectNavigationPage
      -> createProjectSceneState(activePageId, activeWorkspaceId)
      -> resolveNavigationProbeProjectScene
      -> activeWorkspaceId меняется
      -> debugOperationItems = resolveVisibleProjectSceneItems(projectScene)
      -> debugRenderItems = resolveItemsWithSidebarNavigationContent(debugOperationItems, navigationState)
      -> GridOperationProbeItems
```

Важная граница:

```txt
source scene
  shellItems            не участвуют в page transition
  workspaceItemsById    не меняются transition-слоем

render/projection
  current workspace     может получить enter-анимацию
  previous workspace    может временно рисоваться как exit-overlay
```

Page transition не должен:

- записывать что-либо в `projectScene`;
- менять `shellItems`;
- менять `workspaceItemsById`;
- обновлять `sidebar.content`;
- идти через scene operation;
- попадать в `sidebar-element` state policy.

Page transition должен:

- начинаться только при смене страницы/workspace;
- хранить временный снимок предыдущей workspace-render сцены;
- рисовать предыдущую workspace-сцену отдельным read-only overlay;
- анимировать текущую workspace-сцену как enter;
- очищаться по таймеру после `durationMs`;
- работать даже если страниц стало больше через нижнюю editor-panel.

#### План Шага 9

| Шаг | Название | Результат | Статус |
| --- | --- | --- | --- |
| 9.0 | Документ и аудит цепочки | Зафиксированы source/render границы transition. | done |
| 9.1 | Transition contract | Pure helper в `engine-adapter`, экспорт только через фасад. | done |
| 9.2 | Host transition state | `LayoutCanvas` хранит временное состояние перехода без source-коммита. | done |
| 9.3 | Workspace-only overlay | Предыдущая workspace-сцена рисуется read-only слоем, sidebar не входит в overlay. | done |
| 9.4 | Enter/exit CSS | Текущая workspace-сцена получает enter-анимацию, предыдущая - exit-анимацию. | done |
| 9.5 | Regression checks | Тесты подтверждают contract, sidebar exclusion и отсутствие source mutation. | done |
| 9.6 | Sidebar menu actions | `sidebar.content` кнопки с `select-page` запускают тот же workspace transition. | done |

## Первая Контрольная Точка

До внутренней сетки нужно доказать базовое:

```txt
sidebar один
sidebar общий для всех страниц
sidebar сохраняет положение и state
workspace blocks меняются при смене страницы
fixed sidebar продолжает резервировать место
нижняя панель остается editor-panel
```

Только после этого можно безопасно добавлять `sidebar.content`.

Статус: контрольная точка пройдена в этапах A/B/C. Следующий безопасный шаг - расширение контракта `sidebar.content`.

## Безопасный Переход К Shell/Workspace Split

Переход делаем в три коротких этапа.

### Этап A. Pure Helpers Без UI

Сначала добавляем только чистую модель project scene в adapter-слой:

```txt
engine-adapter/project-scene
  createProjectSceneState
  resolveActiveWorkspaceItems
  resolveVisibleProjectSceneItems
  resolveProjectSceneOperationScope
  resolveProjectSceneStorageSnapshot
```

На этом этапе:

- [x] `LayoutCanvas` не меняется;
- [x] UI не подключается к новой модели;
- [x] sidebar еще не переносится в shell;
- [x] добавляются тесты на `shellItems + activeWorkspaceItems`;
- [x] фиксируется правило, что visible scene является projection, а source хранится раздельно.

Базовая реализация этапа A:

| Файл | Роль |
| --- | --- |
| `engine-adapter/project-scene/projectSceneState.js` | Pure helpers project scene: state, active workspace items, visible projection, operation scope, conflicts, storage snapshot. |
| `engine-adapter/tests/projectSceneStateCases.js` | Регрессия на `shellItems + activeWorkspaceItems`, scope операций, конфликт id и миграцию storage v1 -> v2 snapshot. |

Экспорт идет только через `engine-adapter/index.js`.

### Этап B. Подключить Project Scene Facade В Host

После проверки helpers `LayoutCanvas` должен стать тоньше:

```txt
LayoutCanvas
  -> project scene facade
    -> activePageId
    -> activeWorkspaceId
    -> shellItems
    -> workspaceItemsById
    -> visibleSceneItems
```

На этом этапе:

- [x] текущие операции продолжают работать;
- [x] storage переходит к snapshot-формату;
- [x] old storage v1 должен читаться через миграцию;
- [x] source/projection contract не должен сломаться.

Базовая реализация этапа B:

| Файл | Роль |
| --- | --- |
| `src/editor-surface/navigation/navigationProbeProjectScene.js` | Создает начальное project scene состояние для debug/navigation host. |
| `src/editor-surface/operations/operationProbeStorage.js` | Читает/пишет project scene snapshot v2 и мигрирует legacy items v1. |
| `src/layout/LayoutCanvas.jsx` | Использует project scene facade: source хранится в project scene, visible scene берется как adapter projection. |

Важно: на этапе B `shellItems` остаются пустыми. Sidebar еще не переносится в shell; это будет отдельный этап C.

### Этап C. Перенести Persistent Sidebar В Shell

Только после этапов A и B:

- [x] persistent sidebar переносится из workspace items в `shellItems`;
- [x] visible scene собирается из `shellItems + activeWorkspaceItems`;
- [x] операции получают явный scope: `shell` или `workspace`;
- [x] проверяется, что sidebar не исчезает и не дублируется при переключении страниц;
- [x] fixed sidebar продолжает резервировать место.

Базовая реализация этапа C:

| Файл | Роль |
| --- | --- |
| `engine-adapter/project-scene/projectSceneState.js` | Добавлена policy-функция `isShellItem`, scope-aware merge visible scene -> shell/workspace и миграция workspace shell-items в `shellItems`. |
| `src/editor-surface/navigation/navigationProbeProjectScene.js` | Debug host policy: sidebar считается persistent shell item. |
| `src/layout/LayoutCanvas.jsx` | При загрузке, смене страницы и source-коммите применяет debug shell policy. |
| `src/editor-surface/navigation/navigationProbeProjectSceneCases.js` | Проверяет, что стартовый `sidebar-a` уходит в shell, удаляется из workspace и остается видимым на другой странице. |

На этом этапе sidebar уже является persistent shell item в debug host. Внутренняя сетка sidebar и пользовательская sidebar-навигация еще не добавлены.
