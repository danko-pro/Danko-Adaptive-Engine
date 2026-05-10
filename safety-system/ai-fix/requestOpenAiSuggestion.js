export async function requestOpenAiSuggestion({ prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1";

  if (!apiKey) {
    return {
      ok: false,
      status: null,
      model,
      text: "",
      error: "OPENAI_API_KEY is not set."
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "developer",
          content: "Ты отвечаешь как senior engineer. Предлагай минимальные, проверяемые изменения."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      model,
      text: "",
      error: payload.error?.message ?? response.statusText
    };
  }

  return {
    ok: true,
    status: response.status,
    model,
    text: readOutputText(payload),
    error: null
  };
}

function readOutputText(payload) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  const chunks = [];

  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n").trim();
}
