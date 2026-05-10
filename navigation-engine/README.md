# Navigation Engine V3

`navigation-engine` - отдельный наблюдательный слой для страниц, маршрутов, меню и shell-областей.

Он не заменяет `adaptive-engine` и не управляет блоками `composition-engine`.

## Граница ответственности

- V1 `adaptive-engine`: строгая геометрия, сетка, операции, ошибки.
- V2 `composition-engine`: смысл блоков внутри активного workspace.
- V3 `navigation-engine`: страницы, маршруты, меню, активный workspace, зарезервированная область shell.

Правильный поток:

```text
host pages/routes/navigation
-> navigation-engine
-> usable workspace
-> composition-engine
-> adaptive-engine
-> host adapter
```

V3 пока работает в режиме отчета: возвращает план, связи, предупреждения и предложения. Он не меняет React, роутер, DOM и CSS.

## Host Usable Workspace

Host может передать в V3 уже посчитанный `usableWorkspace`. V3 пересчитывает эту область сам на основе `metrics` и `shell.reservedArea`.

Если значения не совпадают, V3 возвращает предупреждение `HOST_USABLE_WORKSPACE_MISMATCH`. Это не ломает план, но сообщает, что сайт и движок по-разному понимают рабочую область.
