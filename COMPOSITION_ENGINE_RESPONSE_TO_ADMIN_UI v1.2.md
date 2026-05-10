# Ответ composition-engine на `V2_COMPONENT_MAP 1.2`

Дата: 2026-05-09.

Этот файл можно передать стороне `admin-ui` как ответ от текущего проекта движка. Он фиксирует, что карта компонентов сайта прочитана правильно, и описывает, как готовить сайт к интеграции с `adaptive-engine` V1 и будущим `composition-engine` V2.

## Короткий вывод

`V2_COMPONENT_MAP 1.2` описывает именно тот тип host-карты, который нужен движку.

Главное совпадение:

```text
feature model/state
-> workspace registry / component map
-> workspace adapter snapshot
-> adaptive-engine V1
-> composition-engine V2
-> host adapter
-> React UI
```

Это правильное направление. Движок не должен читать хаотичный JSX и не должен делать выводы только по DOM. Источником истины должны быть manifest, registry, adapter snapshot, capabilities, relationships и dataKey.

## Что уже есть на стороне движка

В текущем проекте уже выделены три независимые зоны:

| Слой | Назначение |
|---|---|
| `adaptive-engine` | V1. Строгий layout kernel: сетка, area, операции, отказы, проверки, снимок, диагностика. |
| `engine-adapter` | Мост между host/UI и движком. Здесь живут команды, layout map, safety projection и граница передачи поведения в V2. |
| `composition-engine` | V2. Смысловой наблюдатель: роли блоков, workspace zones, layout intents, diagnostics, relations, proposals. |

V1 сейчас считается стабильной базой. V2 не должен встраиваться внутрь `adaptive-engine` и не должен спорить с ним за координаты.

## Что V2 уже понимает

Текущий `composition-engine` умеет принимать:

```js
{
  mode,
  metrics,
  items,
  contentSchemas,
  dependencies
}
```

Где:

| Поле | Смысл |
|---|---|
| `mode` | `off`, `suggest`, `auto`. Сейчас рабочий режим - `suggest`. |
| `metrics` | Размер рабочей области в колонках/строках. |
| `items` | V1-compatible блоки `{ id, x, y, w, h, meta }`. |
| `contentSchemas` | Семантика блоков: `header`, `content`, `sidebar`, `control`, `warning`, `unknown`. |
| `dependencies` | Явные связи блоков. Например: control управляет content. |

На выходе V2 возвращает:

| Поле | Смысл |
|---|---|
| `status` | `ready`, `warning`, `error`, `disabled`. |
| `workspace` | Зоны рабочей области: верх/центр/низ, левый/центр/правый сектор. |
| `blocks` | Обогащенные блоки с ролью, позицией, краями, intent. |
| `relations` | Связи между блоками. |
| `issues` | Сигналы и предупреждения. |
| `proposals` | Предложения для adapter/host UI. |

## Текущие relation types V2

Сейчас в V2 уже добавлены базовые связи:

| Relation | Смысл |
|---|---|
| `header-to-workspace` | Header относится ко всей рабочей области. |
| `content-with-sidebar` | Sidebar связан с основным content. |
| `control-for-content` | Control управляет content. |
| `warning-for-content` | Warning относится к content. |
| `unknown-needs-role` | Блоку нужна явная роль. |

Это первый слой. Его можно расширять под реальные `WorkspaceRelationship` из `admin-ui`.

## Как admin-ui должен готовить snapshot

Для интеграции сайт должен передавать не DOM, а нормализованный snapshot:

```ts
{
  id: string,
  title: string,
  behaviorMode: "off" | "suggest" | "auto",
  manifest: WorkspaceManifest,
  validation: WorkspaceValidationReport,
  layoutItems: WorkspaceLayoutItem[],
  constraints: WorkspaceConstraint[],
  meta: {
    source: "host-manifest",
    registryIds: string[],
    componentCount: number,
    elementCount: number,
    valid: boolean
  }
}
```

Минимальный mapping в текущий V2:

```text
snapshot.layoutItems -> composition.items
snapshot.manifest.components[].type -> composition.contentSchemas[item.id].type
snapshot.manifest.relationships -> composition.dependencies / future relations
snapshot.validation -> host-side guard before engine call
snapshot.constraints -> future constraints bridge
snapshot.behaviorMode -> composition.mode / adapter behavior boundary
```

## Что нельзя угадывать

Это важно оставить жестким правилом:

V2 не должен сам угадывать:

- можно ли удалять блок;
- можно ли двигать блок;
- можно ли менять размер;
- можно ли сворачивать блок;
- является ли блок условным;
- является ли блок критическим;
- пишет ли поле в проектные данные;
- является ли список отдельным layout item;
- какой компонент является источником бизнес-данных.

Все это должно приходить из manifest/registry/capabilities/relationships.

## Что нужно расширить в V2 следующим шагом

Карта `admin-ui` уже шире, чем текущий минимальный V2. Поэтому следующий честный шаг - расширять не автоматику, а язык понимания.

### 1. Расширить типы блоков

Сейчас V2 знает:

```text
header, content, sidebar, control, warning, unknown
```

Из карты `admin-ui` нужно постепенно добавить:

```text
workspace
stage
panel
toolbar
form
list
table
summary
editor
metric
navigation
popover
```

Важно: добавлять не как цвета, а как смысловые роли.

### 2. Расширить типы relationships

В `admin-ui` уже есть отношения:

```text
controls
selects
writes
summarizes
depends-on
```

Их стоит перенести в `composition-engine` как отдельный словарь relation types. Тогда V2 сможет строить не просто layout-карту, а карту ответственности.

### 3. Разделить parent blocks и inner elements

Parent blocks могут становиться V1 layout items.

Inner elements не должны автоматически становиться layout items. Они должны жить внутри parent block и описывать:

- поля;
- кнопки;
- статусы;
- метрики;
- dropdown;
- таблицы;
- списки;
- popover controls.

Это граница будущего “кропа” V2: V1 управляет областями, V2 понимает внутреннюю композицию области.

### 4. Добавить capabilities в V2 context

Текущий V2 пока видит в основном геометрию, тип и зависимости. Для реальной интеграции ему нужны:

```text
movable
resizable
deletable
copyable
collapsible
fixed
conditional
parent-only
```

Без этого V2 может предложить действие, которое host-проект выполнять не должен.

### 5. Добавить layoutParticipation

`layoutParticipation` нужно учитывать до передачи в V1/V2:

| Значение | Правило |
|---|---|
| `always` | Участвует в layout projection. |
| `conditional` | Реальный UI, но включается только при явном состоянии. |
| `none` | Не layout item, только semantic element. |

## Что не делать сейчас

Не нужно сейчас:

- заставлять V2 напрямую двигать реальные компоненты сайта;
- смешивать V2 внутрь V1;
- читать DOM как главный источник истины;
- подгонять engine под один экран калькулятора;
- превращать каждый inner element в layout block;
- включать `auto` без adapter boundary и режима отката.

## Рекомендуемый ближайший план

1. Оставить V1 строгим и стабильным.
2. Сохранять `admin-ui` manifest как основной источник истины.
3. Передавать в V2 только активную workspace-зону.
4. Расширить V2 relation types под `controls`, `selects`, `writes`, `summarizes`, `depends-on`.
5. Расширить V2 block types под реальные типы из `WorkspaceComponentSchema`.
6. Добавить capabilities/layoutParticipation в V2 context.
7. Оставить V2 в режиме `suggest`, пока host adapter не научится явно принимать/отклонять предложения.

## Что передать обратно движку от admin-ui

Для следующего шага полезен не весь JSX, а один небольшой runtime snapshot активной области:

```ts
{
  workspaceId,
  activeRoute,
  metrics,
  components: [
    {
      id,
      parentId,
      type,
      area,
      dataKey,
      capabilities,
      layoutParticipation
    }
  ],
  elements: [
    {
      id,
      parentId,
      type,
      role,
      dataKey
    }
  ],
  relationships: [
    {
      sourceId,
      targetId,
      type
    }
  ]
}
```

Это даст V2 достаточно данных, чтобы строить карту смысла без угадывания.

## Итог

`V2_COMPONENT_MAP 1.2` подтверждает правильный путь.

Сайт уже начал приводить себя к форме, которую движок сможет понимать:

```text
не хаотичный UI
а manifest -> snapshot -> engine adapter -> V1/V2
```

Следующая задача не в том, чтобы V2 стал “умнее магически”, а в том, чтобы дать ему строгий язык:

```text
blocks + elements + capabilities + relationships + layoutParticipation
```

После этого V2 сможет уверенно советовать, как перестраивать интерфейс, не ломая данные, роли и намерения host-проекта.
