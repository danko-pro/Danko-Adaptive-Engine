# Engine V1 Stop Line

Дата фиксации: 2026-05-07

Этот документ ставит границу для текущей версии `adaptive-engine`.

V1 не является движком всего сайта. V1 - это крепкий layout kernel.

Его задача: уверенно управлять сеткой, областями, layout-операциями, ограничениями, отказами и диагностикой. Все, что относится к кнопкам, формам, данным, формулам и шаблонам, остается будущим слоем.

## Главная формула V1

```text
workspace
-> grid metrics
-> areas
-> layout
-> operations
-> constraints
-> rejections
-> diagnostics
-> public API
```

Если новая идея не усиливает эту цепочку, она не входит в V1.

## Что входит в V1

V1 отвечает за:

- расчет адаптивной grid-сетки;
- расчет колонок, строк, размера ячейки и размеров grid;
- работу с областью `{ x, y, w, h }`;
- проверку попадания области в сетку;
- проверку пересечений;
- нормализацию layout items;
- применение операций create/move/resize/delete;
- rollback при невалидной операции;
- ограничения области;
- единый отказ при невозможной операции;
- диагностику состояния движка;
- публичный facade через `adaptive-engine/core/index.js`;
- safety-system проверки структуры, импортов, тестов и сборки.

## Что не входит в V1

Пока не делаем:

- `ElementSchema`;
- `ElementRegistry`;
- Data Engine;
- Formula Engine;
- Template Engine;
- Component Engine;
- описание кнопок, input, card, text, background;
- внутреннюю иерархию UI-компонентов;
- хранение данных;
- бизнес-формулы калькулятора;
- полноценный apply-mode в калькуляторе;
- автоматическое переставление layout без явного режима;
- `suggest` и `auto` как поведение по умолчанию.

Эти темы относятся к будущей Element/Data Platform.

## Критерии готовности V1

V1 можно считать доведенной до stop-line, когда:

1. `operations` возвращают единый результат для всех действий.
2. `rejections` встроены в operation pipeline.
3. `constraints` реально учитываются при move/resize/create.
4. Любая невалидная операция возвращает контролируемый отказ.
5. Исходный layout не мутируется при ошибке.
6. Diagnostics может объяснить состояние движка человеку.
7. Public API стабилен и идет через `core/index.js`.
8. Safety-system ловит незавершенные assistant-слои.
9. Документация явно отделяет V1 layout kernel от будущей Element/Data Platform.

## Базовое поведение

V1 работает строго.

```text
valid operation -> apply
invalid operation -> reject
layout -> keep previous state
```

Движок не должен молча чинить layout.

Движок не должен самостоятельно двигать соседние блоки.

Движок не должен угадывать намерение пользователя.

## Роль rejections

`rejections` отвечает на вопрос:

```text
Почему действие запрещено?
```

Пример:

```js
{
  rejected: true,
  code: "AREA_COLLISION",
  message: "Operation rejected: area collides with another block.",
  targetId: "editor",
  blockerId: "summary",
  canSuggest: true,
  canAutoFix: false
}
```

`rejections` не исправляет layout. Он объясняет отказ.

## Роль constraints

`constraints` отвечает на вопрос:

```text
Какие действия с областью запрещены или ограничены?
```

Примеры:

- минимальная ширина;
- минимальная высота;
- максимальная ширина;
- максимальная высота;
- запрет move;
- запрет resize.

Constraints должны влиять на операции, но не должны знать про React-компоненты.

## Роль diagnostics

`diagnostics` отвечает на вопрос:

```text
Что сейчас происходит с движком и можно ли доверять результату?
```

Diagnostics должен объяснять:

- состояние workspace;
- warnings;
- layout errors;
- operation failures;
- rejection codes;
- invalid metrics;
- invalid rules.

Diagnostics не меняет layout.

## Будущая граница V2

После V1 можно проектировать следующую платформу:

```text
Element/Data Platform
```

Возможные будущие слои:

```text
elements/
element-registry/
data-bindings/
formulas/
templates/
interaction/
```

Но они не должны попадать в V1.

V2 будет отвечать на вопросы:

- что это за элемент;
- кто его parent;
- какие у него children;
- с какими данными он связан;
- какие значения вычисляются;
- как переиспользовать родительскую область как template.

V1 отвечает только за layout kernel.

## Правило добавления новых assistant-слоев

Новый assistant можно добавлять только если он отвечает на отдельный фундаментальный вопрос layout kernel.

Примеры допустимых V1 assistant-слоев:

```text
area        -> что такое область
layout      -> как живет набор областей
operations  -> как менять layout
constraints -> что запрещено
rejections  -> почему отказано
diagnostics -> как объяснить состояние
```

Примеры недопустимых V1 assistant-слоев:

```text
button
input
card
text
background
formula
database
template
```

Они относятся к будущей Element/Data Platform.

## Ближайший технический фокус

Порядок движения:

1. Встроить `rejections` в `operations`.
2. Подключить `constraints` к операциям.
3. Унифицировать operation result.
4. Расширить diagnostics под operation/rejection.
5. Закрыть V1 stop-line.
6. Заморозить добавление новых assistant-слоев без отдельного решения.

## Главное правило

Если новая идея вызывает желание добавить еще один assistant, сначала спросить:

```text
Это усиливает V1 layout kernel?
Или это уже будущая Element/Data Platform?
```

Если это Element/Data Platform, идею нужно документировать, но не внедрять в V1.
