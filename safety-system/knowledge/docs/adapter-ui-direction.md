# Направление adapter/UI

После фиксации V1 движка основной фокус переносится на `engine-adapter` и тестовый UI.

## Роль adapter

`engine-adapter` переводит действия пользователя в язык движка.

Примеры:

- клик по ячейке -> selection;
- двойной клик и ввод текста -> intent создания области;
- перетаскивание блока -> operation `move-area`;
- растягивание ручки -> operation `set-area`;
- отказ движка -> откат UI к предыдущему состоянию.

## Важное правило

UI не должен сам решать, можно ли поставить, двигать или растягивать блок.

UI может:

- собрать намерение;
- показать подсветку;
- показать статус;
- применить успешный результат;
- откатить состояние при отказе.

Решение принимает `adaptive-engine`.

## Текущая цепочка

```text
пользователь
-> src/editor-surface
-> engine-adapter
-> adaptive-engine
-> engine-adapter
-> src/editor-surface
```

`src/editor-surface` отвечает за визуальное отображение и события React.

`engine-adapter` отвечает за перевод событий в команды движка.

`adaptive-engine` отвечает за истину: valid/rejected, layout, diagnostics.

## Что можно менять сейчас

На текущем этапе можно менять:

- `engine-adapter`;
- `src`;
- `safety-system`;
- dashboard;
- AI-шлюз;
- документацию вне замороженного движка.

Нельзя случайно менять `adaptive-engine`.

## Layout occupancy для fixed sidebar

На `mobile` и `narrow` fixed sidebar рисуется как top-bar, но source-координаты блока в сцене
могут оставаться desktop-зоной слева/справа.

Правило adapter:

- для selection, scene operations, fit, composition и V2 diagnostics использовать
  `engine-adapter/scene/resolveSceneLayoutEngineInput.js` (`resolveSceneLayoutOccupancyItems` и связанные helpers);
- не проверять коллизии fixed sidebar только по `item.x/y/w/h`, если viewport перевёл sidebar
  в `viewportLayout: top-bar`;
- UI-state mobile menu (`open/close`) живёт в `sidebar-element/runtime/mobileSidebarRuntimeState.js`
  и не смешивается с layout occupancy.

Публичные входы selection:

- клик по сетке -> `resolveAdapterSelection`;
- selection после operation -> `resolveSelectionAfterOperation` (тоже через occupancy).

## Следующий фокус

Ближайшие улучшения должны добавляться сначала как сценарии `engine-adapter`, а UI должен только
подключать и отображать их.

Возможные сценарии:

- создание области выделением прямоугольника;
- drag preview;
- resize preview;
- удаление выбранного блока клавишей;
- переименование блока;
- перевод rejection в человеческие сообщения;
- простая история действий на уровне adapter.
