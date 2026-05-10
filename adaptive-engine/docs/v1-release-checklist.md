# V1 Release Checklist

Дата сверки: 2026-05-07

Этот документ фиксирует финальную сверку V1 `adaptive-engine`.

V1 считается не движком всего сайта, а самостоятельным layout kernel: он управляет сеткой, областями, layout-операциями, ограничениями, отказами, диагностикой и публичным API.

## Статус

Статус V1: готов к фиксации как layout kernel.

Последний полный safety-cycle:

- assistant-слоев: 14;
- структурных проверок: 343;
- предупреждений структуры: 0;
- тесты: пройдены;
- сборка тестового UI: пройдена.

## Что входит в V1

- Расчет адаптивной grid-сетки.
- Расчет колонок, строк, размера ячейки и размеров grid.
- Работа с областями `{ x, y, w, h }`.
- Проверка попадания области в сетку.
- Проверка пересечений областей.
- Нормализация layout items.
- Обработка layout pipeline.
- Операции `create-area`, `move-area`, `resize-area`, `set-area`, `delete-area`.
- Rollback при невалидной операции.
- Ограничения областей через `constraints`.
- Единый отказ через `rejections`.
- Единый публичный результат через `EngineResult`.
- Диагностика snapshot, layout и operation/rejection результата.
- Публичный facade через `adaptive-engine/core/index.js`.
- Safety-system для структуры, импортов, тестов и сборки.

## Что сознательно не входит в V1

- `ElementSchema`.
- `ElementRegistry`.
- Data Engine.
- Formula Engine.
- Template Engine.
- Component Engine.
- Описание кнопок, input, card, text, background.
- Внутренняя иерархия UI-компонентов.
- Хранение данных.
- Бизнес-формулы калькулятора.
- Полноценный apply-mode в калькуляторе.
- Автоматическое переставление layout без явного режима.
- `suggest` и `auto` как поведение по умолчанию.

Эти темы относятся к будущей Element/Data Platform.

## Intent layer

После фиксации V1 добавлен минимальный слой `intents`.

Он не применяет layout и не знает про UI-события. Его задача:

```text
adapter intent -> operation
```

Первый поддержанный intent:

```js
resolveAreaIntent({
  type: "create-area-from-cell",
  cell: { x: 10, y: 6 },
  value: "1"
})
```

Результат:

```js
{
  valid: true,
  operation: {
    type: "create-area",
    targetId: "cell-10-6",
    payload: { x: 10, y: 6, w: 1, h: 1 },
    meta: { kind: "text", value: "1" }
  }
}
```

Adapter получает operation и сам передает ее в `applyOperation`.

```text
UI event -> adapter -> intents -> operation -> applyOperation -> EngineResult
```

`intents` не должен знать про double click, input, React-компоненты или конкретный калькулятор.

## Публичный API V1

Host-проект должен импортировать движок через:

```js
import {
  applyOperation,
  calculateGridMetrics,
  createAdaptiveGrid,
  createDiagnosticsReport,
  createEngineResult,
  createEngineSnapshot,
  resolveAreaIntent,
  processLayoutItems,
  resolveGridRules,
  resolveWorkspaceState
} from "adaptive-engine/core/index.js";
```

Главные точки входа:

- `calculateGridMetrics(workspace, rules)` - расчет сетки.
- `createAdaptiveGrid(workspace, options)` - высокий вход для adaptive grid.
- `processLayoutItems(items, metrics)` - проверка и обработка layout.
- `applyOperation(items, operation, metrics, constraints)` - применение операции.
- `createEngineSnapshot(metrics, layoutResult)` - снимок состояния движка.
- `createDiagnosticsReport(snapshot, engineResult)` - отчет для человека/host-проекта.
- `createEngineResult(payload)` - единая форма результата.
- `resolveAreaIntent(input)` - перевод adapter-намерения в operation.

## Контракт результата

Публичный результат движка должен иметь форму:

```js
{
  valid,
  rejected,
  action,
  data,
  errors,
  rejection,
  report,
  meta,
  details
}
```

Правило:

```text
valid operation -> apply
invalid operation -> reject
layout -> keep previous state
```

Движок не чинит layout молча и не двигает соседние блоки без явного будущего режима.

## Ручной тестовый UI

Для ручного drag/resize UI должен использовать `set-area`.

`set-area` атомарно передает движку полный следующий прямоугольник:

```js
{
  type: "set-area",
  targetId: "area-id",
  payload: {
    x: 3,
    y: 4,
    w: 8,
    h: 5
  }
}
```

Это нужно для resize во все стороны: при изменении левой или верхней границы меняются не только `w/h`, но и `x/y`.

Правило ручного UI:

```text
pointer draft -> set-area -> applyOperation -> valid ? commit : rollback + rejection
```

## Правило добавления новых assistant-слоев

В V1 новые assistant-слои не добавляются без отдельного решения.

Перед добавлением нового слоя нужно ответить:

```text
Это усиливает V1 layout kernel?
Или это уже будущая Element/Data Platform?
```

Если идея относится к Element/Data Platform, ее нужно документировать, но не внедрять в V1.

## Финальная сверка stop-line

- `operations` возвращают единый результат: выполнено.
- `rejections` встроены в operation pipeline: выполнено.
- `constraints` учитываются при create/move/resize: выполнено.
- Невалидная операция возвращает контролируемый отказ: выполнено.
- Исходный layout не мутируется при ошибке: выполнено.
- Diagnostics объясняет snapshot/layout/operation/rejection: выполнено.
- Public API идет через `core/index.js`: выполнено.
- Safety-system ловит незавершенные assistant-слои: выполнено.
- Документация отделяет V1 layout kernel от Element/Data Platform: выполнено.

## Следующий этап после V1

Следующий этап не должен начинаться с новых функций layout kernel.

Сначала нужно обсудить направление:

- полировка V1 и интеграция в host-проект;
- проектирование V2 Element/Data Platform;
- минимальный adapter contract для калькулятора;
- режимы поведения `strict`, `suggest`, `auto`, но без включения `auto` по умолчанию.

## Откат V2 behavior

Экспериментальный слой поведения блоков был удален из рабочей ветки.

Причина: ранняя версия пыталась автоматически адаптировать блоки при изменении workspace и нарушила базовую стабильность V1.

Текущее правило:

```text
V1 не меняет layout автоматически при изменении workspace.
Операции выполняются только явно через adapter -> operation -> applyOperation.
```

Идеи V2 можно обсуждать позже, но без подключения к рабочему UI до отдельной архитектурной фиксации.

## Актуальная защита V1 adapter

После ручной проверки добавлена защитная подгонка отображения в `engine-adapter`.

Это не V2 behavior и не автоматический layout engine. Это тонкая страховка UI-проекции при изменении размеров workspace:

- настоящий layout хранится отдельно от временной проекции;
- временная проекция не должна становиться источником правды;
- блок, который был зафиксирован от левого края до правого края, при изменении количества колонок снова занимает всю текущую ширину;
- блок, который был зафиксирован у правого края, при изменении количества колонок сохраняет привязку к правому краю;
- блоки в середине не двигаются без явной операции пользователя;
- явные операции по-прежнему проходят через `adapter -> operation -> applyOperation`;
- отказ операции по-прежнему не меняет исходный layout.

Защитные сценарии закреплены тестом:

```text
test:adapter-fit
```

Этот тест должен падать, если широкий блок перестает возвращаться на всю ширину или правый блок снова уходит за край при ресайзе.
