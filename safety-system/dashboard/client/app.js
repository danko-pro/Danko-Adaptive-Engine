const view = {
  status: document.querySelector("#status"),
  output: document.querySelector("#output"),
  prompt: document.querySelector("#prompt"),
  suggestion: document.querySelector("#suggestion"),
  patch: document.querySelector("#patch"),
  resultLabel: document.querySelector("#result-label"),
  exitCode: document.querySelector("#exit-code"),
  errorCount: document.querySelector("#error-count"),
  passedCount: document.querySelector("#passed-count"),
  assistantCount: document.querySelector("#assistant-count"),
  structureCount: document.querySelector("#structure-count"),
  freezeCount: document.querySelector("#freeze-count"),
  commandName: document.querySelector("#command-name"),
  promptSize: document.querySelector("#prompt-size"),
  suggestionSize: document.querySelector("#suggestion-size"),
  patchSize: document.querySelector("#patch-size"),
  buttons: [...document.querySelectorAll("button")]
};

document.querySelector("#run-check").addEventListener("click", () => {
  runCommand("/api/check", "Запускаю полную проверку проекта...", "Проверка прошла, ошибок нет.");
});

document.querySelector("#run-ai").addEventListener("click", () => {
  runCommand("/api/ai-suggest-fix", "Запрашиваю предложение ИИ...", "Предложение ИИ готово.");
});

document.querySelector("#load-latest").addEventListener("click", loadLatest);

loadLatest();

async function runCommand(url, loadingText, successText) {
  setBusy(true, loadingText);

  try {
    const payload = await postJson(url);
    renderCommandResult(payload);
    renderLatest(payload.latest);

    if (payload.busy) {
      setStatus("Команда уже выполняется. Дождитесь завершения.", "warn");
      return;
    }

    setStatus(payload.ok ? successText : "Команда завершилась с ошибкой.", payload.ok ? "ok" : "fail");
  } catch (error) {
    setStatus(error.message, "fail");
  } finally {
    setBusy(false);
  }
}

async function loadLatest() {
  setBusy(true, "Загружаю последние данные...");

  try {
    const payload = await fetchJson("/api/latest");
    renderLatest(payload);
    setStatus("Последние данные загружены.", "ok");
  } catch (error) {
    setStatus(error.message, "fail");
  } finally {
    setBusy(false);
  }
}

function renderCommandResult(payload) {
  const structure = payload.stats?.structure;
  const freeze = payload.stats?.freeze;

  view.output.textContent = payload.output || "Пустой вывод.";
  view.commandName.textContent = payload.command || "Команда выполнена";
  view.resultLabel.textContent = payload.ok ? "готово" : "ошибка";
  view.exitCode.textContent = payload.exitCode ?? "-";
  view.errorCount.textContent = payload.stats?.errors ?? 0;
  view.passedCount.textContent = payload.stats?.passed ?? 0;
  view.assistantCount.textContent = structure?.assistants ?? "-";
  view.structureCount.textContent = structure?.checks ?? "-";
  view.freezeCount.textContent = freeze?.files ?? "-";
}

function renderLatest(latest) {
  setTextValue(view.prompt, latest?.prompt || "");
  setTextValue(view.suggestion, latest?.suggestion || "");
  setTextValue(view.patch, latest?.patch || "");

  view.promptSize.textContent = formatSize(view.prompt.value);
  view.suggestionSize.textContent = formatSize(view.suggestion.value);
  view.patchSize.textContent = formatSize(view.patch.value);
}

async function postJson(url) {
  const response = await fetch(url, { method: "POST" });
  return readJsonResponse(response);
}

async function fetchJson(url) {
  const response = await fetch(url);
  return readJsonResponse(response);
}

async function readJsonResponse(response) {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || response.statusText);
  }

  return payload;
}

function setTextValue(node, value) {
  node.value = value;
}

function formatSize(value) {
  return `${value.length} символов`;
}

function setBusy(isBusy, label = "") {
  for (const button of view.buttons) {
    button.disabled = isBusy;
  }

  if (isBusy) {
    setStatus(label, null);
  }
}

function setStatus(text, tone) {
  view.status.textContent = text;
  view.status.className = "status";

  if (tone) {
    view.status.classList.add(`is-${tone}`);
  }
}
