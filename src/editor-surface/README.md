# Editor Surface

React-слой редактора: probes, operation panels, navigation host и локальная инспекция сетки.

Это **не** domain-слой. Переносимая логика живёт в `engine-adapter` и `sidebar-element`.

## Структура

- `config/` — переключатели dev/prod инструментов (`debugFlags`).
- `icons/` — SVG-иконки UI редактора.
- `intents/` — UI создания блоков из ячеек.
- `metrics/` — overlay метрик сетки.
- `operations/` — operation probe, меню блоков, sidebar UI orchestration.
- `navigation/` — debug navigation host (pages, routes, shell policy).
- `pointer/`, `probes/`, `selection/` — визуальные probes сетки.
- `telemetry/`, `layout-map/` — телеметрия и карта layout.

## Импорт

Host (`LayoutCanvas`) импортирует публичный фасад:

```js
import { debugFlags, GridOperationProbeItems } from "../editor-surface/index.js";
```

Domain и scene commands — только через `engine-adapter/index.js` и `sidebar-element/index.js`.
