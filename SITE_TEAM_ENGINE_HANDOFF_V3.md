# Handoff для команды сайта: состояние движка и новый V3 navigation-engine

Этот документ описывает текущее состояние проекта движка и то, как команде сайта готовить архитектуру под V1, V2 и новый V3.

Главная мысль: сайт не должен становиться движком, а движок не должен становиться сайтом. Между ними должен быть понятный контракт и adapter.

## 1. Текущее состояние проекта

В проекте сейчас есть четыре ключевых слоя.

```text
adaptive-engine/      -> V1: строгая геометрия, сетка, операции, ошибки
engine-adapter/       -> слой перевода между UI/host и движком
composition-engine/   -> V2: смысловая композиция блоков внутри workspace
navigation-engine/    -> V3: страницы, маршруты, меню, shell и активный workspace
```

Дополнительно:

```text
src/                  -> тестовый UI для ручной проверки
safety-system/        -> проверки, заморозка V1, guardrails, тесты
```

Полная проверка проекта:

```bash
npm run check
```

На текущем этапе проверка проходит:

- V1 заморожен и защищен.
- V2 подключен как наблюдательный слой.
- V3 добавлен как отдельный наблюдательный слой.
- UI-сборка проходит.

## 2. Роли слоев

### V1 adaptive-engine

V1 отвечает только за строгую геометрию:

- рабочая область;
- сетка;
- координаты;
- area;
- layout items;
- move / resize / create / delete / set;
- коллизии;
- выход за границы;
- ошибки, отказы, отчеты.

V1 не знает про React, страницы, меню, маршруты, вкладки, компоненты сайта и смысл блоков.

### engine-adapter

Adapter переводит действия host/UI в язык движка:

```text
UI action -> adapter command -> engine operation -> engine result -> UI state
```

Adapter не должен быть визуальным компонентом. Он не должен рисовать интерфейс. Он должен переводить состояния и команды.

### V2 composition-engine

V2 смотрит на блоки внутри активного workspace и пытается понять их смысл:

- header;
- content;
- sidebar;
- control;
- warning;
- unknown;
- группы;
- связи;
- адаптационные сигналы для desktop/tablet/mobile.

V2 сейчас ничего сам не переставляет. Он возвращает отчет, связи, предупреждения и предложения.

### V3 navigation-engine

V3 отвечает за уровень выше workspace:

- страницы;
- маршруты;
- меню;
- активную страницу;
- активный route;
- активный workspace;
- состояние shell;
- зарезервированную область под меню;
- usable workspace, который дальше можно передавать V2/V1.

V3 также пока ничего сам не меняет. Он наблюдает, валидирует и возвращает план.

## 3. Правильный общий поток

```text
host pages/routes/navigation
-> navigation-engine V3
-> usable workspace
-> composition-engine V2
-> adaptive-engine V1
-> host adapter
-> React UI
```

Иначе:

```text
Страницы и меню -> V3
Смысл блоков внутри активной области -> V2
Координаты и операции -> V1
Отображение и состояние сайта -> host UI
```

## 4. Что V3 уже умеет

`navigation-engine` сейчас умеет:

- принимать список страниц;
- принимать список routes;
- принимать список workspaces;
- принимать описание меню;
- принимать активные `activePageId`, `activeRouteId`, `activeWorkspaceId`;
- различать состояния меню:
  - `pinned`;
  - `overlay`;
  - `collapsed`;
  - `hidden`;
- считать `reservedArea`;
- считать `usableWorkspace`;
- строить связи:
  - `selects`;
  - `mounts`;
  - `focuses`;
  - `projects`;
  - `constrains`;
- выдавать `issues`;
- выдавать `proposals`.

## 5. Что сайт должен отдавать V3

Команда сайта должна подготовить слой данных, который описывает страницы, маршруты, меню и рабочие области.

Минимальный вход для V3:

```js
{
  metrics: {
    columns: 80,
    rows: 30
  },

  activePageId: "calculator",
  activeRouteId: "calculator-route",
  activeWorkspaceId: "calculator-workspace",

  pages: [
    {
      id: "calculator",
      title: "Калькулятор",
      routeId: "calculator-route",
      workspaceId: "calculator-workspace"
    }
  ],

  routes: [
    {
      id: "calculator-route",
      path: "/calculator",
      workspaceId: "calculator-workspace"
    }
  ],

  workspaces: [
    {
      id: "calculator-workspace",
      defaultComponentId: "summary"
    }
  ],

  navigation: {
    id: "main-menu",
    state: "pinned",
    placement: "left",
    scope: "global",
    items: [
      {
        id: "menu-calculator",
        label: "Калькулятор",
        pageId: "calculator",
        routeId: "calculator-route"
      }
    ]
  },

  shell: {
    reservedArea: {
      left: 8,
      right: 0,
      top: 0,
      bottom: 0
    }
  }
}
```

## 6. Что означает reservedArea

`reservedArea` — это область, которую shell забирает у workspace.

Например, левое закрепленное меню шириной 8 колонок:

```js
reservedArea: {
  left: 8,
  right: 0,
  top: 0,
  bottom: 0
}
```

Тогда V3 вернет:

```js
usableWorkspace: {
  x: 9,
  y: 1,
  columns: 72,
  rows: 30
}
```

То есть V2/V1 должны работать уже не со всей страницей, а с очищенной рабочей областью.

## 7. Состояния меню

### pinned

Меню встроено в layout и занимает место.

Пример:

```text
left menu + workspace
```

В этом режиме `reservedArea` обязателен.

### collapsed

Меню свернуто в rail, но все равно занимает место.

В этом режиме `reservedArea` тоже нужен, но обычно меньше.

### overlay

Меню открывается поверх интерфейса.

В этом режиме оно не должно уменьшать workspace.

```js
reservedArea: {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
}
```

### hidden

Меню не видно и не занимает место.

## 8. Что V3 возвращает

V3 возвращает план:

```js
{
  engine: "navigation-engine",
  version: "0.1.0",
  valid: true,
  status: "ready",

  summary: {
    pages: 1,
    routes: 1,
    workspaces: 1,
    navigationItems: 1,
    relations: 4,
    issues: 0,
    proposals: 0
  },

  active: {
    pageId: "calculator",
    routeId: "calculator-route",
    workspaceId: "calculator-workspace"
  },

  reservedArea: {
    left: 8,
    right: 0,
    top: 0,
    bottom: 0
  },

  usableWorkspace: {
    x: 9,
    y: 1,
    columns: 72,
    rows: 30
  },

  relations: [],
  issues: [],
  proposals: []
}
```

## 9. Важные связи V3

V3 различает связи:

```text
selects    -> меню выбирает страницу или route
mounts     -> route монтирует workspace
focuses    -> workspace указывает главный компонент
projects   -> пункт навигации проецируется в workspace
constrains -> shell/меню ограничивает workspace
```

Эти связи нужны, чтобы движок понимал не только блоки на сетке, но и то, почему они там появились.

## 10. Что нужно подготовить в сайте

Команде сайта нужно подготовить:

1. `Page Registry`
   Список страниц с понятными id.

2. `Route Registry`
   Список маршрутов и связь route -> workspace.

3. `Workspace Registry`
   Список рабочих областей, которые может открыть страница.

4. `Navigation Projection`
   Описание меню и его пунктов.

5. `Shell State`
   Состояние меню: pinned, collapsed, overlay или hidden.

6. `Reserved Area`
   Сколько места shell забирает у workspace.

7. `Runtime Snapshot`
   Снимок активной страницы, workspace, блоков, связей и metrics.

## 11. Чего не делать

Не нужно:

- заставлять V1 знать про страницы;
- заставлять V2 знать про роутер;
- передавать меню как обычный content-блок;
- смешивать глобальное меню и локальные вкладки блока;
- считать overlay-меню частью layout;
- прятать reserved area в CSS без явного контракта;
- заставлять движок угадывать структуру по DOM;
- делать route равным visual block;
- делать page равной workspace component.

## 12. Как разделять меню

Нужно различать:

```text
global navigation   -> главное меню сайта
workspace navigation -> переключатели внутри рабочей области
block navigation    -> вкладки или меню внутри конкретного блока
overlay navigation  -> временные drawer/popover состояния
```

Пока V3 главным образом описывает global/workspace уровень. Block-level меню позже может стать отдельным подслоем.

## 13. Как это связано с V2

V3 должен сначала определить активный workspace и usable область.

Потом V2 анализирует только блоки внутри этой usable области.

```text
V3: где активная рабочая область и сколько места занял shell?
V2: какие блоки внутри рабочей области и как они связаны?
V1: валидны ли координаты и операции?
```

## 14. Что делать с текущими компонентами сайта

Каждый важный компонент сайта нужно постепенно привести к описательному формату:

```js
{
  id: "summary",
  type: "content",
  title: "Сводка",
  workspaceId: "calculator-workspace",
  routeId: "calculator-route",
  area: { x: 1, y: 1, w: 12, h: 6 },
  capabilities: {
    movable: true,
    resizable: true,
    deletable: false
  },
  relations: [
    { type: "reads", targetId: "estimate.total" }
  ]
}
```

Смысл: компонент не должен сам решать все. Он должен описать себя, а adapter передаст это движкам.

## 15. Текущий статус V3

V3 уже добавлен в проект:

```text
navigation-engine/
  contracts/
  createNavigationContext.js
  createNavigationIssue.js
  resolveNavigationProjection.js
  resolveNavigationPlan.js
  resolveReservedWorkspaceArea.js
  index.js
  README.md
  tests/navigationPlanCases.js
```

Проверка:

```bash
npm run test:navigation
npm run check
```

Сейчас V3 — наблюдательный слой. Он не применяет изменения автоматически.

## 16. Ближайший правильный следующий шаг для команды сайта

Не нужно сразу подключать V3 к реальному роутеру.

Сначала нужно подготовить данные:

1. Описать страницы.
2. Описать маршруты.
3. Описать workspace для каждой страницы.
4. Описать главное меню.
5. Описать состояние shell.
6. Посчитать reserved area.
7. Сформировать snapshot.
8. Проверить snapshot через V3.
9. Только потом передавать usable workspace в V2/V1.

## 17. Главная граница

V3 не управляет React Router напрямую.

V3 говорит:

```text
Вот активная страница.
Вот активный route.
Вот active workspace.
Вот сколько места заняло меню.
Вот usable workspace.
Вот проблемы в навигационной структуре.
Вот предложения.
```

Host решает, как это применить в UI.

Это защищает сайт от хаоса, а движок от превращения в конкретный сайт.
