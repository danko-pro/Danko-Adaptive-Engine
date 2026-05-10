# Adaptive Engine

`adaptive-engine` — отдельный слой проекта за пределами `src`.

Его задача — считать реальную рабочую область браузера и отдавать UI готовые метрики адаптивной grid-сетки, координатную систему и layout-модель.

## Структура

```text
adaptive-engine/
├── area/
│   ├── areaErrorCodes.js
│   ├── createArea.js
│   ├── index.js
│   ├── resolveArea.js
│   └── validateArea.js
├── calculators/grid/
│   ├── calculateGridMetrics.js
│   └── resolveGridTracks.js
├── config/
│   ├── defaultGridRules.js
│   ├── engineVersion.js
│   ├── gridRuleProfiles.js
│   ├── gridRuleWarnings.js
│   ├── resolveWorkspaceState.js
│   ├── resolveGridRules.js
│   ├── selectGridRuleProfile.js
│   └── workspaceStateLimits.js
├── contracts/
│   └── gridTypes.js
├── coordinates/
│   ├── createGridCoordinateSystem.js
│   └── validateGridArea.js
├── diagnostics/
│   ├── createDiagnosticIssue.js
│   ├── createDiagnosticsReport.js
│   ├── diagnosticCodes.js
│   ├── diagnosticMessages.js
│   ├── diagnosticSeverity.js
│   ├── diagnosticStatus.js
│   └── index.js
├── core/
│   ├── createAdaptiveGrid.js
│   ├── createEngineSnapshot.js
│   └── index.js
├── layout/
│   ├── createLayoutError.js
│   ├── createLayoutReport.js
│   ├── detectAreaCollision.js
│   ├── layoutErrorCodes.js
│   ├── normalizeLayoutItem.js
│   ├── normalizeLayoutItems.js
│   ├── prepareLayoutItems.js
│   ├── processLayoutItems.js
│   ├── resolveLayoutItems.js
│   └── validateLayoutItems.js
├── modes/
│   ├── gridModeNames.js
│   ├── index.js
│   └── resolveGridMode.js
├── observers/
│   └── observeWorkspace.js
├── operations/
│   ├── applyOperation.js
│   ├── createOperation.js
│   ├── createOperationError.js
│   ├── createOperationReport.js
│   ├── index.js
│   ├── operationErrorCodes.js
│   ├── operationTypes.js
│   └── validateOperation.js
├── selection/
│   ├── createSelectionResult.js
│   ├── index.js
│   ├── resolveSelection.js
│   ├── selectionErrorCodes.js
│   ├── selectionTypes.js
│   └── validateSelectionInput.js
├── tests/
└── validators/
    ├── assertGridMetrics.js
    ├── validateGridMetrics.js
    └── validateGridRules.js
```

## Слои

`area/` отвечает за одну область `{ x, y, w, h }`: создание, проверку формы и резолв в pixel rect.
Статус: реализован, покрыт тестами и проверен визуально через временный debug area probe.

`config/` хранит единый источник дефолтных правил, профили правил, версию движка и resolver итоговых правил.

`core/` — публичный фасад. UI должен импортировать движок отсюда.

`observers/` считывает факты браузера.

`operations/` описывает и применяет действия над layout items через существующий layout pipeline.

`selection/` определяет, что находится в указанной grid cell: area, обычная cell или empty/out-of-grid.

`calculators/` считает размеры сетки, ячейки, колонок и строк.

`coordinates/` создаёт координатную систему поверх рассчитанных metrics и проверяет область относительно сетки.

`diagnostics/` превращает engine snapshot в единый диагностический отчет со статусом, severity и issues.

`layout/` нормализует, валидирует, резолвит и диагностирует layout items.

`modes/` определяет именованные режимы сетки по рассчитанным метрикам.

`validators/` проверяет rules, metrics и инварианты результата.

`tests/` проверяет геометрию без браузера.

## Контракт

- `gap` не участвует в геометрии сетки.
- CSS получает `--grid-gap: 0px`.
- `cellSize` находится между `minCellSize` и `maxCellSize`.
- `columns` находится между `minVisibleColumns` и `maxColumns`.
- `rows` находится между `minVisibleRows` и `maxRows`.
- `gridWidth = columns * cellSize`.
- `gridHeight = rows * cellSize`.
- Координаты ячеек начинаются с `1`.
- Pixel rect считается от `0`.
- Одна область описывается как `{ x, y, w, h }`.
- Одна область обслуживается area-ассистентом.
- Layout item описывается как `{ id, x, y, w, h }`.
- Ошибки layout-слоя имеют формат `{ type, itemId, itemIds, details }`.
- `processLayoutItems` — официальный вход в layout pipeline.

## Pipeline

```text
raw layout items
→ normalizeLayoutItems
→ validateLayoutItems
→ resolveLayoutItems
→ createLayoutReport
→ processLayoutItems result
```

`processLayoutItems` возвращает:

```js
{
  valid,
  items,
  errors,
  report,
  meta
}
```

## Страховки

`validateGridRules.js` защищает rules от `NaN`, отрицательных значений, нулевых размеров и перепутанных `min/max`.

`validateGridMetrics.js` проверяет, что metrics пригодны для координатных и layout-расчётов.

`assertGridMetrics.js` проверяет итоговую геометрию и CSS variables.

`createAdaptiveGrid.js` ловит ошибки observer/calculator цепочки и возвращает безопасные initial metrics.

`processLayoutItems` возвращает `INVALID_METRICS`, если metrics непригодны для layout-расчётов.

При неожиданном сбое `processLayoutItems` возвращает `PROCESS_FAILED`, а не роняет UI.

## Дефолтные правила

```js
{
  minColumns: 30,
  minVisibleColumns: 8,
  maxColumns: 80,
  minRows: 30,
  minVisibleRows: 18,
  maxRows: 60,
  fitPadding: 2,
  minCellSize: 16,
  maxCellSize: 30
}
```

## Проверка

```powershell
npm run check:imports
npm run test:area
npm run test:grid
npm run test:grid-mode
npm run test:grid-rules
npm run test:workspace-state
npm run test:metrics-validation
npm run test:coordinates
npm run test:layout
npm run test:resolve
npm run test:report
npm run test:process
npm run test:snapshot
npm run test:diagnostics
npm run test:operations
npm run test:selection
npm run build
npm run check
```

`npm run check` запускает все тесты движка и сборку.

`npm run check:imports` проверяет, что UI импортирует adaptive-engine только через `adaptive-engine/core/index.js`.

## Правило импорта

UI-слой должен импортировать adaptive-engine только через:

```js
import { createAdaptiveGrid } from "../../adaptive-engine/core/index.js";
```

Внутренние файлы ассистентов не должны становиться обычной точкой входа для `src`.

## Текущая зрелость

```text
Для прототипа: 9/10
Для фундамента ранней версии: 7.5/10
Для production-движка: 4/10
```

## Архитектурное направление

Движок развивается как набор защищённых доменных ассистентов:

```text
metrics assistant
coordinate assistant
area assistant
layout assistant
operation assistant
diagnostics assistant
```

Ответственность:

- `metrics` — размеры сетки, ячейки, колонок и строк.
- `coordinates` — перевод координат сетки в пиксели и проверка области относительно сетки.
- `area` — одна область `{ x, y, w, h }`.
- `layout` — набор областей как будущие элементы интерфейса.
- `operations` — действия над областями и layout.
- `diagnostics` — отчёты, ошибки, снимки и будущая self-healing логика.

Правила:

- каждый ассистент имеет собственную границу ответственности;
- каждый ассистент общается с другими через явный контракт;
- слой не должен мутировать входные данные;
- UI не должен импортировать внутренности ассистентов напрямую;
- будущие операции должны проходить через единый operation pipeline;
- ошибки должны сохранять единый формат.

## Следующий уровень архитектуры

Следующий архитектурный шаг — отделить сами правила сетки от выбора стратегии адаптации.

Сейчас `defaultGridRules.js` хранит базовые ограничения: минимальные и максимальные размеры ячейки, колонок и строк.
Это хороший фундамент, но со временем одного набора правил будет мало.

Слои:

- `grid modes` — именованные режимы работы сетки.
- `rules resolver` — слой, который выбирает итоговые правила под текущую рабочую область.
- `engine snapshot` — полный снимок состояния движка для UI, debug и диагностики.

Статус:

```text
grid modes       базовая версия реализована
rules resolver   базовая версия реализована
engine snapshot  расширен mode/rules/warnings/debug-полями
```

### Grid modes

`grid modes` — это не магия и не визуальный стиль.
Это понятное имя для состояния сетки.

Примеры будущих режимов:

```text
desktop
tablet
mobile
compact-width
compact-height
```

Режим даёт движку возможность явно сказать: "сейчас я работаю в условиях узкой ширины" или "сейчас не хватает высоты".

Возможности:

- точнее выбирать ограничения сетки;
- понятнее показывать debug-информацию;
- не смешивать разные сценарии адаптации в одном калькуляторе;
- проще тестировать поведение на разных размерах экрана.

### Rules resolver

`rules resolver` — это слой, который получает факты рабочей области и возвращает итоговые правила для расчёта сетки.

Пример логики без магии:

```text
workspace маленький по ширине
→ включаем compact-width
→ разрешаем меньше видимых колонок
→ сохраняем ячейку в безопасном диапазоне
→ отдаём итоговые rules в metrics calculator
```

Возможности:

- иметь несколько наборов правил без хаоса;
- менять поведение сетки не внутри UI, а внутри движка;
- держать `calculateGridMetrics` проще;
- тестировать выбор правил отдельно от расчёта геометрии.

Текущий контракт resolver:

```js
{
  rules,
  meta: {
    source,
    profile,
    profileStatus,
    profileEnabled,
    candidate,
    candidateEnabled,
    reason,
    selectionReason,
    workspaceState
  }
}
```

`profile` сейчас равен `base`.
Это означает: применён базовый профиль правил без изменения поведения сетки.

`base` имеет статус `calibrated` и включён.

Будущие профили:

```text
narrow
short
tiny
```

имеют статус `planned` и сейчас выключены.

Если `workspaceState` указывает на будущий профиль, selector возвращает его как `candidate`, но продолжает выбирать `base`.
Например:

```text
workspaceState: narrow
candidate: narrow
candidateEnabled: false
profile: base
selectionReason: candidate-disabled
```

Это позволяет видеть будущую ветку выбора профилей без изменения текущей геометрии.

`workspaceState` сейчас может быть:

```text
unknown
empty
tiny
narrow
short
measured
```

Это не меняет геометрию напрямую.
Это диагностический слой, который говорит, в каких условиях resolver готовил правила.

Пороги `workspaceState` хранятся в `workspaceStateLimits.js`:

```js
{
  narrowWidth: 480,
  shortHeight: 480
}
```

Правило границы:

- значение меньше порога попадает в `narrow` или `short`;
- значение, равное порогу, уже считается `measured`.

Само определение состояния вынесено в `resolveWorkspaceState.js`.
Это отдельный датчик базового режима, который можно калибровать и тестировать без изменения grid geometry.

Результаты ручной калибровки зафиксированы в `docs/base-profile-calibration.md`.

Карта будущих сценариев движка зафиксирована в `docs/engine-scenarios.md`.

`warnings` сейчас может содержать:

```text
BASE_PROFILE_CALIBRATION
WORKSPACE_MISSING
WORKSPACE_EMPTY
WORKSPACE_TINY
WORKSPACE_NARROW
WORKSPACE_SHORT
```

Эти предупреждения не являются ошибками.
Они нужны, чтобы debug, snapshot и будущая diagnostics-система понимали, что расчет был выполнен в особых условиях.

Выбор профиля вынесен в `selectGridRuleProfile.js`.
Сейчас он всегда возвращает `base`, потому что базовый профиль калибруется первым.
Позже именно здесь появится безопасный выбор между `base`, `mobile`, `short`, `wide` и другими профилями.

### Engine snapshot

`engine snapshot` — это полный снимок состояния движка в один момент времени.

Он может включать:

```js
{
  version,
  mode,
  rules,
  metrics,
  coordinates,
  layout,
  warnings,
  debug
}
```

Возможности:

- UI получает одну понятную модель состояния;
- debug overlay может показывать не только числа, но и причину этих чисел;
- diagnostics слой сможет сохранять историю состояний;
- проще искать ошибки: видно, какие rules и mode привели к конкретной сетке.

### Diagnostics assistant

`diagnostics assistant` работает поверх snapshot.

Разделение ответственности:

```text
engine snapshot      факты состояния
diagnostics report   оценка этих фактов
```

`createDiagnosticsReport(snapshot)` возвращает:

```js
{
  engineVersion,
  timestamp,
  status,
  summary,
  issues,
  snapshot
}
```

`status` может быть:

```text
ok
warning
error
```

Каждый issue имеет форму:

```js
{
  code,
  severity,
  source,
  message,
  details
}
```

Коды и сообщения diagnostics вынесены в registry:

```text
diagnosticCodes.js
diagnosticMessages.js
```

Это нужно, чтобы:

- тесты опирались на стабильные коды;
- сообщения не были зашиты в report creator;
- будущий self-healing слой мог строить задачу по `code`;
- severity определялась централизованно.

Задача этого слоя — не менять сетку, а объяснять состояние движка единым языком.

### Operation assistant

`operation assistant` отвечает за действия над layout items.

Он не слушает мышку, не рисует UI и не управляет DOM.
Его задача — принять operation object, проверить его и вернуть новый layout result.

Текущая поддержанная операция:

```js
{
  type: "create-area",
  targetId: "area-id",
  payload: {
    x: 1,
    y: 1,
    w: 4,
    h: 3
  }
}
```

```js
{
  type: "move-area",
  targetId: "area-id",
  payload: {
    x: 4,
    y: 5
  }
}
```

Удаление области:

```js
{
  type: "delete-area",
  targetId: "area-id"
}
```

Также поддерживается изменение размера:

```js
{
  type: "resize-area",
  targetId: "area-id",
  payload: {
    w: 6,
    h: 4
  }
}
```

`applyOperation(items, operation, metrics)` возвращает:

```js
{
  valid,
  items,
  operation,
  errors,
  layout,
  report,
  meta
}
```

`report` имеет форму:

```js
{
  valid,
  type,
  targetId,
  changed,
  beforeCount,
  afterCount,
  errors,
  errorsByType
}
```

Правило:

- operation assistant меняет только raw layout items;
- итоговая проверка геометрии проходит через `processLayoutItems`;
- если операция приводит к ошибке layout, исходные `items` возвращаются без изменения.

### Selection assistant

`selection assistant` отвечает на вопрос: что находится в указанной grid cell.

Он не слушает мышку и не работает с DOM.
UI передаёт уже вычисленную cell-координату:

```js
resolveSelection({
  cell: { x: 7, y: 10 },
  items,
  metrics
})
```

Результат:

```js
{
  valid,
  type,
  cell,
  itemId,
  item,
  reason
}
```

Типы:

```text
area
cell
empty
```

Ошибки:

```text
INVALID_CELL
INVALID_METRICS
OUT_OF_GRID
```

Если несколько items покрывают одну cell, выбирается последний item в массиве как верхний.

## Текущий статус ассистентов

```text
metrics assistant      реализован
coordinate assistant   реализован
area assistant         реализован
layout assistant       реализован
operation assistant    базовая версия реализована
diagnostics assistant  базовая версия реализована
selection assistant    базовая версия реализована
```

`area assistant` включает:

- `createArea`
- `validateArea`
- `resolveArea`
- `AREA_ERRORS`
- публичный `area/index.js`
- тесты `test:area`
- временную визуальную проверку через `GridDebugAreaProbe`

## План развития

- автоматические браузерные visual tests
- проверка реального DOM-рендера
- модель размещения блоков по координатам
- operation assistant
- diagnostics assistant
- события и статусы движка
- performance-контроль
- typed API через TypeScript или более строгий JSDoc
- CI-проверки
- диагностика scrollbars и overflow
- safe-area и системные панели
- локальный diagnostics/self-healing слой после появления локальной нейросети

