# Sidebar Layer Plan

## Цель

Построить слой сцены над замороженным `adaptive-engine`, чтобы sidebar был не просто прямоугольником на сетке, а элементом с состоянием, слоем, правилами размещения и предсказуемыми переходами.

## Красная линия

- Не менять `adaptive-engine`.
- Не добавлять в низкоуровневый движок знания о sidebar, overlay, hidden, collapsed или UI.
- Не чинить частные баги обходными проверками в компонентах, если правило относится к сцене.
- Не делать `collapsed` и `hidden` “на глаз” до фиксации их контракта.

До красной линии вся логика живет в `sidebar-element` и `engine-adapter`.

## Уже принято

| State | Layer | Резервирует место | Блоки могут быть под ним | Render mode | Reflow при входе |
| --- | --- | --- | --- | --- | --- |
| `fixed` | `layout` | да | нет | `visible` | да |
| `overlay` | `overlay` | нет | да | `visible` | нет |
| `collapsed` | `overlay` | нет | да | `collapsed` | нет |
| `hidden` | `overlay` | нет | да | `hidden` | нет |

Главное правило: только `fixed` влияет на блоки рабочей области.

## План до красной линии

1. [x] Зафиксировать единую таблицу политики sidebar-состояний.
2. [x] Подключить все layer-решения к этой таблице, чтобы не было разрозненных `if`.
3. [x] Описать scene projection:
   - `layoutItems` идут в `adaptive-engine`;
   - `overlayItems` не участвуют в layout-коллизиях;
   - `hidden` остается состоянием sidebar, но не должен резервировать место.
4. [x] Сделать единый adapter gateway для операций сцены:
   - `create`;
   - `move`;
   - `resize`;
   - `delete`;
   - `set-sidebar-state`.
5. [x] Описать известные ошибки уровня сцены:
   - `SIDEBAR_REFLOW_FAILED`;
   - `LAYER_OPERATION_BLOCKED`;
   - `NO_SPACE_AFTER_FIXED_SIDEBAR`;
   - `INVALID_STATE_TRANSITION`.
6. [x] Развести renderer по слоям:
   - layout blocks;
   - overlay elements;
   - menus and controls;
   - debug overlays.
7. [x] После каждого шага закреплять поведение тестом.

## После красной линии

Если adapter-слой станет слишком большим, выделить отдельный `scene-engine`, но только после того, как контракт слоев стабилизируется.
