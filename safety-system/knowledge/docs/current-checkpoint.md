# Текущий checkpoint

## Статус

Проект находится в точке фиксации после выноса `engine-adapter`.

## Что считается готовым

- `adaptive-engine` доведен до V1 stop-line.
- `adaptive-engine` заморожен через safety freeze-check.
- `engine-adapter` вынесен в отдельный корневой слой.
- `src/editor-surface` работает как тестовая лаборатория.
- Safety dashboard вынесен в отдельный слой.
- AI-шлюз использует knowledge layer вместо одного большого статичного prompt.

## Рабочая цепочка

```text
пользователь
-> src/editor-surface
-> engine-adapter
-> adaptive-engine
-> engine-adapter
-> src/editor-surface
```

## Что можно менять дальше

Можно развивать:

- `engine-adapter`;
- `src/editor-surface`;
- `safety-system`;
- knowledge docs.

Нельзя случайно менять:

- `adaptive-engine`.

## Ближайшая цель

Играть с функциями и возможностями `engine-adapter`, расширяя удобство действий без изменения движка.

## Актуальная рабочая фиксация V2

Текущие решения по V2, группам, зависимостям блоков, runtime-отказам и границе ответственности зафиксированы в:

```text
composition-engine/V2_DECISION_LOG.md
```

Перед крупными изменениями в `composition-engine`, `engine-adapter` или `engine-runtime` нужно сверяться с этим файлом и дополнять его, если меняется направление.

## Большой вектор

Будущий проект должен объединить два мира:

- layout engine: геометрия, сетка, размещение, операции;
- semantic/data layer: смысл блоков, данные, связи, таблицы, формулы.

Сейчас реализован фундамент layout/adapter. Semantic/data layer пока не реализуется, но держится как
следующий большой архитектурный горизонт.
