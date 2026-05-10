# Калибровка base profile

Документ фиксирует ручную калибровку базового профиля adaptive-engine.

На этом этапе калибруется только датчик `workspaceState`.
Геометрия сетки, правила расчёта колонок, строк и размера ячейки не менялись.

## Текущие пороги

```js
{
  narrowWidth: 480,
  shortHeight: 480
}
```

Правило границы:

- значение меньше порога попадает в специальное состояние;
- значение, равное порогу, считается рабочим `measured`.

## Замеры ширины

| № | Сценарий | Workspace | Grid | State | Mode | Horizontal | Vertical | Columns | Rows | Cell | Вывод |
|---|---|---:|---:|---|---|---|---|---:|---:|---:|---|
| 1 | Browser maximized + DevTools справа | 843.6 x 1056 | 840 x 1050 | measured | maximum | compact | normal | 28 | 35 | 30px | Рабоче |
| 2 | Browser maximized | 2256 x 1056 | 2250 x 1050 | measured | maximum | normal | normal | 75 | 35 | 30px | Хорошо |
| 3 | Половина экрана | 1044 x 1054.8 | 1020 x 1050 | measured | maximum | normal | normal | 34 | 35 | 30px | Хорошо |
| 4 | Минимум другого браузера | 690 x 1050 | 660 x 1020 | measured | maximum | compact | normal | 22 | 34 | 30px | Рабоче |
| 5 | Чуть шире минимума | 894 x 1050 | 870 x 1020 | measured | maximum | compact | normal | 29 | 34 | 30px | Хорошо |
| 6 | DevTools около 600 x 800 | 615.6 x 804 | 588.06 x 801.9 | measured | compact-width | compact | normal | 22 | 30 | 26.73px | Рабоче |
| 7 | DevTools около 560 x 800 | 564 x 802.8 | 560.49 x 800.7 | measured | compact-width | compact | normal | 21 | 30 | 26.69px | Рабоче |
| 8 | DevTools около 534 x 800 | 534 x 802.8 | 507.11 x 800.7 | measured | compact-width | compact | normal | 19 | 30 | 26.69px | Рабоче |
| 9 | DevTools узкий | 408 x 802.8 | 400.35 x 800.7 | narrow | compact-width | compact | normal | 15 | 30 | 26.69px | Narrow оправдан |

### Решение по ширине

`narrowWidth: 480` оставлен без изменений.

Причина:

- 534px, 564px, 615px и 690px визуально остаются рабочими состояниями;
- 408px уже оправданно определяется как `narrow`;
- повышение порога до 560 или 600 помечало бы рабочую сетку как слишком узкую.

## Замеры высоты

| № | Сценарий | Workspace | Grid | State | Mode | Horizontal | Vertical | Columns | Rows | Cell | Вывод |
|---|---|---:|---:|---|---|---|---|---:|---:|---:|---|
| 10 | DevTools высота около 520 | 802.8 x 482.4 | 800.5 x 480.3 | measured | normal | normal | normal | 50 | 30 | 16.01px | Рабоче, почти нижняя граница cell |
| 11 | DevTools высота около 440 | 802.8 x 438 | 800 x 432 | short | minimum | normal | compact | 50 | 27 | 16px | Short оправдан |

### Решение по высоте

`shortHeight: 480` оставлен без изменений.

Причина:

- 482px ещё рабочее состояние `measured`;
- 438px уже компактно по высоте и оправданно получает `short`;
- при 438px ячейка упирается в `minCellSize: 16px`.

## Итог

Текущие пороги базового профиля подтверждены ручной калибровкой:

```js
{
  narrowWidth: 480,
  shortHeight: 480
}
```

На текущем этапе `workspaceState` остаётся диагностическим датчиком.
Он не меняет профиль правил и не управляет геометрией сетки напрямую.
