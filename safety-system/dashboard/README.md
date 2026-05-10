# Safety Dashboard

Админка системы безопасности вынесена в отдельный слой `safety-system/dashboard`.

## Назначение

Dashboard нужен, чтобы человек видел то же, что видит агент:

- полный вывод проверки проекта;
- статус ошибок и успешных проверок;
- количество слоев движка;
- количество структурных проверок;
- состояние заморозки `adaptive-engine`;
- промпт, который отправляется в API;
- ответ ИИ и предложенный патч.

## Структура

```text
safety-system/dashboard/
├── client/
│   ├── app.js
│   └── styles.css
├── server/
│   ├── createOutputStats.js
│   ├── httpResponses.js
│   ├── paths.js
│   ├── readLatestSuggestion.js
│   ├── runSafetyCommand.js
│   └── startDashboardServer.js
├── index.html
└── server.js
```

## Правило слоя

Dashboard не должен менять движок напрямую. Он только:

- запускает safety-команды;
- читает последний промпт/ответ/патч ИИ;
- показывает состояние проекта человеку.

Решение применять патч или размораживать движок остается ручным.
