export function createOutputStats(output) {
  const lines = output.split(/\r?\n/);
  const errorLines = lines.filter((line) =>
    /\b(error|failed|missing|violation|invalid|ошибка|не прошла|не найден)\b/i.test(line)
  );
  const passedLines = lines.filter((line) =>
    /\b(passed|ok|built|пройдено|готово|в порядке)\b/i.test(line)
  );
  const structureMatch = output.match(
    /engine structure check passed: assistants (\d+), checks (\d+), warnings (\d+)/
  );
  const freezeMatch = output.match(/Заморозка движка в порядке: файлов (\d+), изменений нет\./);

  return {
    errors: errorLines.length,
    passed: passedLines.length,
    structure: structureMatch
      ? {
          assistants: Number(structureMatch[1]),
          checks: Number(structureMatch[2]),
          warnings: Number(structureMatch[3])
        }
      : null,
    freeze: freezeMatch
      ? {
          files: Number(freezeMatch[1]),
          changed: false
        }
      : null
  };
}
