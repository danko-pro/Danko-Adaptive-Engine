import { spawn } from "node:child_process";
import path from "node:path";
import { createOutputStats } from "./createOutputStats.js";
import { readLatestSuggestion } from "./readLatestSuggestion.js";

let runningCommand = null;

export function runSafetyCommand(commandName, rootDir) {
  const commandConfig = resolveSafetyCommand(commandName, rootDir);

  if (runningCommand) {
    const output = `Уже выполняется команда: ${runningCommand}. Дождитесь завершения и запустите проверку снова.`;

    return Promise.resolve({
      ok: false,
      busy: true,
      exitCode: null,
      command: runningCommand,
      output,
      stats: createOutputStats(output),
      latest: readLatestSuggestion(rootDir)
    });
  }

  runningCommand = commandConfig.label;

  return new Promise((resolve) => {
    let isSettled = false;
    const chunks = [];
    let child = null;

    try {
      child = spawn(process.execPath, commandConfig.args, {
        cwd: rootDir,
        env: process.env,
        shell: false
      });
    } catch (error) {
      chunks.push(`Ошибка запуска: ${error.message}`);
      finish(1);
      return;
    }

    child.stdout.on("data", (chunk) => chunks.push(chunk.toString()));
    child.stderr.on("data", (chunk) => chunks.push(chunk.toString()));
    child.on("error", (error) => {
      chunks.push(`Ошибка запуска: ${error.message}`);
      finish(1);
    });
    child.on("close", finish);

    function finish(exitCode) {
      if (isSettled) {
        return;
      }

      isSettled = true;
      const output = chunks.join("").trim();
      runningCommand = null;

      resolve({
        ok: exitCode === 0,
        busy: false,
        exitCode,
        command: commandConfig.label,
        output,
        stats: createOutputStats(output),
        latest: readLatestSuggestion(rootDir)
      });
    }
  });
}

function resolveSafetyCommand(commandName, rootDir) {
  if (commandName === "check") {
    return {
      label: "Полная проверка",
      args: [path.join(rootDir, "safety-system", "runAllChecks.js")]
    };
  }

  if (commandName === "ai:suggest-fix") {
    return {
      label: "Предложение ИИ",
      args: [path.join(rootDir, "safety-system", "ai-fix", "runAiFixSuggestion.js")]
    };
  }

  throw new Error(`Неизвестная команда safety-system: ${commandName}`);
}
