# V3 Host Contract

Этот контракт описывает, что host-проект передает в `navigation-engine`.

## Кто главный

Правила интеграции задает команда движка. Host подготавливает данные, но не решает, как V3 должен понимать навигацию, shell и рабочую область.

## Минимальный вход

```js
resolveNavigationPlan({
  metrics: { columns, rows },
  activePageId,
  activeRouteId,
  activeWorkspaceId,
  pages,
  routes,
  workspaces,
  navigation,
  shell,
  usableWorkspace
});
```

`usableWorkspace` опционален. Если host передает его, V3 сравнивает его со своим расчетом.

## Shell

`shell.reservedArea` описывает занятое место вокруг рабочей области:

```js
shell: {
  reservedArea: {
    left: 8,
    right: 0,
    top: 0,
    bottom: 0
  }
}
```

Pinned/collapsed-навигация резервирует место. Overlay/hidden-навигация не должна уменьшать workspace.

## Предупреждение о расхождении

Если host передал:

```js
usableWorkspace: { x: 1, y: 1, columns: 80, rows: 30 }
```

но V3 рассчитал:

```js
usableWorkspace: { x: 9, y: 1, columns: 72, rows: 30 }
```

план останется валидным, но получит `HOST_USABLE_WORKSPACE_MISMATCH`.

Это значит: host и engine видят разные границы рабочей области. Сайт должен поправить слой подготовки данных, а не обходить это в UI.

## Что V3 не делает

- Не импортирует React.
- Не управляет CSS.
- Не создает роуты.
- Не двигает блоки V1.
- Не решает композицию V2.

V3 только говорит, какая область доступна после учета страниц, меню, shell и активного workspace.
