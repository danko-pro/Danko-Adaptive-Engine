# Сайдбар: три изолированных мира

**Задача:** ICON-STRIP-0 — канонический архитектурный документ.  
**Ветка:** `master`.  
**Статус:** контракт и карта кода; runtime на этом шаге не меняется.

См. также ранний обзор: [MOBILE_SIDEBAR_AUDIT_1.md](./MOBILE_SIDEBAR_AUDIT_1.md).

---

## 1. Идея

У одного sidebar-блока в сцене три **независимых мира раскладки**:

| # | Мир | Когда активен |
|---|-----|---------------|
| 1 | **Desktop sidebar** | `viewportMode`: `default` (и desktop-раскладка на `narrow`) |
| 2 | **Mobile compact menu button** | `mobile` / `narrow` + `mobileRenderStrategy: compact-menu-button` |
| 3 | **Mobile icon-strip** | `mobile` / `narrow` + `mobileRenderStrategy: icon-strip` |

Миры **2** и **3** переключаются полем `meta.sidebar.mobileRenderStrategy`. Они не равны desktop и не должны писать в его геометрию.

### Главное правило: `content.items` — общий смысл

`content.items` — единый источник **семантики** страниц/кнопок для всех миров:

- `id`, `text`, `action`, `active`, `disabled`, `variant`, `style`, `type`, …

**Геометрия разных миров не смешивается:**

| Мир | Куда пишутся координаты |
|-----|-------------------------|
| Desktop | `content.items[].x/y/w/h` + `content.grid` |
| Compact button | `mobileLayout.compactButtonArea` |
| Icon-strip | `mobileLayout.iconStrip.itemsById[id]` |

Navigation-generated content (`engine-adapter/navigation/createSidebarContentFromNavigationPlan.js`) можно использовать как **read/canonical content** (id, text, action). Но **куда писать x/y/w/h** решает `geometryTarget`, а не источник content.

---

## 2. Контракт данных (`meta.sidebar`)

```
meta.sidebar
├── version, dock, state, trigger, animation
├── expandedArea                    ← мир 1: footprint desktop-shell
├── collapsedSize
├── content
│   ├── grid                        ← мир 1: внутренняя сетка
│   └── items[]                     ← общая семантика + x/y/w/h (только мир 1)
├── mobileRenderStrategy            ← compact-menu-button | icon-strip
├── mobileLayout
│   ├── compactButtonArea           ← мир 2
│   └── iconStrip
│       └── itemsById               ← мир 3: { [contentItemId]: { x, y, w, h } }
└── responsive
```

Нормализация: `sidebar-element/contracts/sidebarElementContract.js`  
Контракт icon-strip: `sidebar-element/contracts/iconStripLayout.js`  
Метка цели геометрии: `sidebar-element/contracts/sidebarContentGeometryTarget.js` (`desktop` | `icon-strip`)

---

## 3. Мир 1 — Desktop sidebar

### Persisted geometry (JSON / scene)

| Поле | Назначение |
|------|------------|
| `expandedArea` | Размер/позиция desktop-оболочки сайдбара на сетке сцены |
| `content.grid` | Колонки/строки внутренней сетки |
| `content.items[].x/y/w/h` | Позиция каждой кнопки внутри сайдбара |

### Calculated / render data (не персистится отдельно)

| Данные | Откуда |
|--------|--------|
| `renderArea` | `resolveSidebarRenderModel` — где рисуется shell на viewport |
| Внутренняя CSS-grid | `resolveSidebarInternalGridStyle(content.grid)` |
| Presentation mode | `mobilePresentation.mode: none` на desktop viewport |

### Runtime-only

— (нет отдельного runtime-state для desktop content)

### Читает

| Файл | Что читает |
|------|------------|
| `sidebar-element/render/resolveSidebarRenderModel.js` | `expandedArea`, `content`, viewport |
| `sidebar-element/contracts/sidebarElementContract.js` | нормализация; `protectAreaBySidebarContent` может расширить `expandedArea` по max координатам в `content.items` |
| `sidebar-element/layer/resolveOperationRenderLayers.js` | собирает render model → `renderInfo.sidebar.content` |
| `sidebar-element/render/resolveMobileSidebarContentRenderMode.js` | на desktop → `DESKTOP_CONTENT` |
| `src/editor-surface/operations/SidebarInternalGrid.jsx` | `content.items`, `content.grid` |
| `src/editor-surface/operations/resolveSidebarInternalGridStyle.js` | `content.grid` |
| `sidebar-element/interaction/sidebarContentItemPointerOperation.js` | content grid, cell hit-test (селектор `.grid-operation-sidebar-content`) |

### Пишет

| Файл | Куда пишет |
|------|------------|
| `sidebar-element/commands/applySidebarContentItemCommand.js` | `content.items`, при geometry — `content.grid`; default `geometryTarget: desktop` |
| `engine-adapter/commands/createSidebarContentItemGeometryOperation.js` | операция `SET_SIDEBAR_CONTENT_ITEM` |
| `engine-adapter/scene/applySidebarContentItemSceneOperation.js` | прокидывает `geometryTarget`, `viewportArea` |
| `src/editor-surface/operations/useSidebarContentPointerInteraction.js` | drag/resize → geometry op (`geometryTarget: desktop`) |
| `sidebar-element/commands/createSidebarElementFromAreaCommand.js` | `expandedArea` + item x/y/w/h при создании из area |

---

## 4. Мир 2 — Mobile compact menu button

### Persisted geometry

| Поле | Назначение |
|------|------------|
| `mobileLayout.compactButtonArea` | `{ x, y, w, h }` круглой кнопки **относительно** `renderArea` shell |

### Calculated / render data

| Данные | Откуда |
|--------|--------|
| `mobilePresentation.mode` | `compact-menu-button` |
| `mobilePresentation.buttonArea` | `resolveSidebarMobilePresentation` — auto-pack или manual area |
| Пункты меню | `content.items` — только text/action/style; **координаты panel не в contract** |
| `renderArea` | top-bar / fixed viewport layout |

### Runtime-only (не в sidebar contract)

| State | Где |
|-------|-----|
| open/closed compact menu | `mobileSidebarRuntimeState.openByKey` — `sidebar-element/runtime/mobileSidebarRuntimeState.js`, React state в `GridOperationProbeItems.jsx` |

### Читает

| Файл | Что читает |
|------|------------|
| `sidebar-element/render/resolveSidebarMobilePresentation.js` | `compactButtonArea`, `renderArea`, strategy |
| `sidebar-element/render/resolveMobileSidebarContentRenderMode.js` | → `COMPACT_BUTTON` |
| `src/editor-surface/operations/MobileSidebarMenuButton.jsx` | `presentation.buttonArea` |
| `src/editor-surface/operations/MobileSidebarMenuPanel.jsx` | `content.items` (семантика) |
| `engine-adapter/interaction/sidebarMobileButtonPointerOperation.js` | canvas grid → relative area |

### Пишет

| Файл | Куда пишет |
|------|------------|
| `engine-adapter/commands/createSidebarMobileButtonAreaOperation.js` | `mobileLayout.compactButtonArea` через `SET_SIDEBAR_SETTINGS` |
| `sidebar-element/commands/applySidebarSettingsCommand.js` | merge `mobileLayout` |
| `src/editor-surface/operations/useSidebarMobileButtonPointerInteraction.js` | drag/resize кнопки → settings op |
| `src/editor-surface/operations/SidebarSettingsMenu.jsx` | смена `mobileRenderStrategy` (не трогает `compactButtonArea` напрямую) |

**Эталон изоляции** для мира 3: отдельная persisted-область + отдельная pointer-операция, без записи в `content.items`.

---

## 5. Мир 3 — Mobile icon-strip

### Persisted geometry

| Поле | Назначение |
|------|------------|
| `mobileRenderStrategy: icon-strip` | выбор мира |
| `mobileLayout.iconStrip.itemsById[id]` | `{ x, y, w, h }` иконки в полосе; ключ = `content.items[].id` |

Desktop `content.items[].x/y/w/h` при icon-strip drag **не меняются**.

### Calculated / render data

| Данные | Откуда |
|--------|--------|
| `resolveMobileIconStripContent(...)` | merge: семантика из `content.items` + geometry из `itemsById` + row-pack fallback |
| `geometryTarget: icon-strip` | метка на presentation-content; **не сохраняется** в JSON |
| `viewportArea` | из `renderArea` shell (top-bar); передаётся в command для grid strip |
| `grid` strip | `columns = renderArea.w`, `rows = renderArea.h` |
| Presentation classes/styles | `resolveMobileIconStripItemPresentation`, `resolveMobileIconStripItemAreaStyle` |

### Runtime-only

— (нет open/closed state; кнопка ⚙ settings — overlay chrome, не contract)

### Читает

| Файл | Что читает |
|------|------------|
| `sidebar-element/render/resolveSidebarMobilePresentation.js` | strategy → mode `icon-strip` |
| `sidebar-element/render/resolveMobileIconStripContent.js` | `content.items` + `iconStrip.itemsById` + viewport |
| `sidebar-element/render/resolveMobileSidebarContentRenderMode.js` | → `ICON_STRIP_CONTENT` |
| `src/editor-surface/operations/OperationGridItem.jsx` | ветка `MobileSidebarIconStrip` |
| `src/editor-surface/operations/MobileSidebarIconStrip.jsx` | resolved strip content |
| `src/editor-surface/operations/resolveMobileIconStripGridStyle.js` | CSS grid strip |
| `src/editor-surface/operations/resolveSidebarContentOperationItems.js` | при `geometryTarget: icon-strip` подставляет **stored** `content`, не overlay |
| `sidebar-element/interaction/sidebarContentItemPointerOperation.js` | hit-test на `.grid-operation-mobile-sidebar-icon-strip.is-content-grid` |

### Пишет

| Файл | Куда пишет |
|------|------------|
| `sidebar-element/commands/applySidebarContentItemCommand.js` | `applyIconStripGeometryCommand` → только `mobileLayout.iconStrip.itemsById`; `withCanonicalSidebarContent` сохраняет desktop `content` без изменения x/y/w/h |
| `sidebar-element/commands/applySidebarSettingsCommand.js` | icon-strip geometry merge; `protectExpandedAreaFromContent: false` если patch без `content` |
| `engine-adapter/commands/createSidebarContentItemGeometryOperation.js` | `geometryTarget`, `viewportArea` в payload |
| `src/editor-surface/operations/useSidebarContentPointerInteraction.js` | drag/resize → `geometryTarget` из `interaction.content` |

---

## 6. Запреты

| Запрет | Почему |
|--------|--------|
| Icon-strip **не пишет** x/y/w/h в desktop `content.items` | иначе ломается desktop layout и `protectAreaBySidebarContent` раздувает `expandedArea` |
| Compact button **не пишет** в `content.items` geometry | area живёт только в `compactButtonArea` |
| Open/closed compact menu **не попадает** в `meta.sidebar` | только React runtime state |
| Presentation overlay (`resolveMobileIconStripContent`) **не подмешивается** в operation source items | иначе desktop content в scene перезаписывается strip-координатами — см. `resolveSidebarContentOperationItems.js` |
| Generated navigation content — read/canonical для id/text/action; **geometry target решает sink** | generated desktop x/y/w/h не должны становиться icon-strip geometry |
| Icon-strip drag **не должен** менять `expandedArea` | shell size — мир 1 |

---

## 7. Правильный flow — icon-strip

```
SidebarSettingsMenu
  → onSetSidebarSettings({ mobileRenderStrategy: icon-strip })
  → SET_SIDEBAR_SETTINGS
  → applySidebarSettingsCommand
  → sidebarElementContract сохраняет mobileRenderStrategy

resolveSidebarRenderModel / resolveOperationRenderLayers
  → mobilePresentation.mode: icon-strip
  → resolveMobileSidebarContentRenderMode → ICON_STRIP_CONTENT

OperationGridItem
  → MobileSidebarIconStrip(content, gridArea=renderArea)

pointer down + drag на иконке
  → useSidebarContentPointerInteraction
  → interaction.content = resolveMobileIconStripContent(...)  // geometryTarget: icon-strip

resolveSidebarContentOperationItems
  → content.geometryTarget === icon-strip → stored desktop content (без overlay)

createSidebarContentItemGeometryOperation
  → geometryTarget: icon-strip, viewportArea: renderArea

applySidebarContentItemSceneOperation
  → applySidebarContentItemCommand

applyIconStripGeometryCommand
  → ищет content item по id в persisted content.items
  → mergeIconStripItemGeometry → mobileLayout.iconStrip.itemsById[id]
  → desktop content.items geometry не меняется
```

Переключение ◉/▤ в UI: `src/editor-surface/operations/SidebarSettingsMenu.jsx`.  
При смене strategy runtime compact-menu закрывается: `GridOperationProbeItems.handleSetSidebarSettings` → `closeAllMobileSidebarMenus()`.

---

## 8. Общие узлы (viewport, layout, fit)

Общие для всех миров; не должны смешивать geometry между мирами:

| Файл | Роль | Риск |
|------|------|------|
| `sidebar-element/adapters/resolveSidebarViewportModeFromMetrics.js` | metrics → viewport | OK |
| `sidebar-element/layout/resolveSidebarFixedViewportLayout.js` | fixed → top-bar на mobile | общий `renderArea` для всех strategy |
| `sidebar-element/render/resolveSidebarRenderModel.js` | render model | `syncExpandedArea` при resolve |
| `sidebar-element/reserved/resolveSidebarReservedArea.js` | reserved band | top-bar occupancy |
| `engine-adapter/fitting/fitLayoutItemsToGrid.js` | fit blocks | restore sidebar source areas |
| `sidebar-element/layer/resolveOperationRenderLayers.js` | UI layers | прокидывает mobile fields |

Refit/composition во время sidebar drag паузится: `useOperationProbeComposition` учитывает `interaction`, `sidebarContentInteraction`, `sidebarMobileButtonInteraction`.

---

## 9. Known incomplete parts

Сценарий icon-strip **не завершён end-to-end**. Зафиксированные пробелы:

### 9.1. `navigationProbeProjectScene` сбрасывает icon-strip

`src/editor-surface/navigation/navigationProbeProjectScene.js` → `resolveNavigationProbeShellSidebarDefaults` **всегда** проставляет:

```js
mobileRenderStrategy: SIDEBAR_MOBILE_RENDER_STRATEGIES.COMPACT_MENU_BUTTON
```

через `createSidebarElementFromAreaCommand`, даже если в shell уже сохранён `icon-strip`.

Тест `navigationProbeProjectSceneCases.js` **ожидает** это поведение (icon-strip → compact после resolve).  
**На следующем шаге это нужно исправить**, а не считать нормой.

### 9.2. Generated navigation items и operation source

`applySidebarContentItemCommand` ищет target **только** в persisted `meta.sidebar.content.items` по `contentItemId`.  
Если navigation projection показывает item, которого ещё нет в persisted content, strip/desktop edit вернёт `content-item-not-found`.

`resolveSidebarContentOperationItems` уже не подмешивает strip overlay в stored content, но **generated navigation content** должен быть доступен для edit в operation pipeline (persist или merge до command).

### 9.3. Тесты separation flow

Контракт и unit-тесты icon-strip в CI есть, но **полный интеграционный сценарий** (strategy preserve + generated nav + три мира без cross-write) — в следующих задачах ICON-STRIP-FIX*.

---

## 10. Next tasks

| ID | Задача |
|----|--------|
| **ICON-STRIP-FIX1** | Preserve `mobileRenderStrategy`; убрать force compact override в `navigationProbeProjectScene` / shell normalize |
| **ICON-STRIP-FIX2** | Generated navigation content editable в icon-strip без pollution desktop geometry (operation source + persist policy) |
| **ICON-STRIP-FIX3** | Full render/write flow tests: compact / icon-strip / desktop separation (strategy, drag, restore desktop) |

---

## 11. Тесты (CI)

| Скрипт | Мир |
|--------|-----|
| `test:sidebar-element` | 1 + strategy |
| `test:sidebar-pointer` | 1 |
| `test:sidebar-operation-items` | изоляция operation source (icon-strip overlay) |
| `test:mobile-sidebar-button-area` | 2 |
| `test:mobile-sidebar-runtime` | 2 runtime |
| `test:mobile-sidebar-panel` | 2 |
| `test:mobile-sidebar-button-activation` | 2 |
| `test:mobile-sidebar-button-edit-mode` | 2 |
| `test:mobile-sidebar-presentation` | 2 + icon-strip mode flag |
| `test:mobile-sidebar-render-strategy` | переключатель strategy |
| `test:icon-strip-contract` | 3 contract |
| `test:mobile-icon-strip-content` | 3 resolve/write |
| `test:mobile-icon-strip-presentation` | 3 UI presentation |
| `test:mobile-icon-strip-area` | 3 grid-area style |
| `test:mobile-icon-strip-settings` | 3 settings chrome |
| `test:debug-navigation-project-scene` | navigation host (**сейчас фиксирует force compact — см. §9.1**) |

---

## 12. Глоссарий

| Термин | Значение |
|--------|----------|
| `renderArea` | Где на сетке сцены рисуется sidebar-shell (на mobile часто top-bar) |
| `expandedArea` | Канонический footprint desktop-сайдбара |
| `mobilePresentation.mode` | `none` \| `compact-menu-button` \| `icon-strip` |
| `geometryTarget` | `desktop` \| `icon-strip` — куда писать координаты операции |
| `viewportArea` | render footprint strip для расчёта grid при icon-strip write |
| Runtime state | open/closed compact menu — только React, не JSON |

---

*Документ ICON-STRIP-0. Обновлять при изменении контракта sidebar или завершении ICON-STRIP-FIX*.*
