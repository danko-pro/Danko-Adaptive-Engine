# Assistant Structure Contract

Этот документ описывает внутреннюю дисциплину `adaptive-engine`.

Если движок требует порядка от host-проекта и будущих workspace-компонентов, то сам движок тоже должен проходить архитектурную проверку.

## Идея

Каждый инструмент движка рассматривается как assistant.

Assistant должен быть не просто набором файлов, а завершенным маршрутом:

```text
folder
-> required files
-> local index.js
-> public exports
-> tests
-> core exports, если слой нужен внешнему UI
-> no imports from src
```

Если маршрут оборван, checker должен показать, где именно.

## Проверяющий скрипт

Структурная проверка находится здесь:

```text
safety-system/checkEngineStructure.js
```

Обычный запуск:

```powershell
npm run check:engine-structure
```

Запуск с трассировкой:

```powershell
npm run check:engine-structure -- --trace
```

Обычный режим выводит короткий итог.
Trace-режим показывает путь проверки каждого assistant.

## Что проверяется сейчас

- `area`
- `calculators/grid`
- `config`
- `coordinates`
- `diagnostics`
- `layout`
- `modes`
- `operations`
- `selection`
- `validators`

Для каждого слоя проверяются:

- наличие папки;
- наличие обязательных файлов;
- наличие тестов;
- экспорт из локального `index.js`;
- экспорт из `adaptive-engine/core/index.js`;
- отсутствие импортов из `src`.

## Зачем это нужно

Этот слой не проверяет бизнес-логику.
Он проверяет, встроен ли инструмент в систему.

Пример проблемы, которую он должен ловить:

```text
новый assistant создан
но нет index.js
или нет теста
или слой не экспортирован через core
или adaptive-engine начал импортировать src
```

Такой инструмент считается архитектурно незавершенным.

## Правило

Новый assistant не считается готовым, пока он не проходит:

```powershell
npm run check:engine-structure
```

Общий `npm run check` уже включает эту проверку.
