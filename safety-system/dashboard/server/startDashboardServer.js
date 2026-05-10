import http from "node:http";
import path from "node:path";
import { sendFile, sendJson } from "./httpResponses.js";
import { dashboardPaths } from "./paths.js";
import { readLatestSuggestion } from "./readLatestSuggestion.js";
import { runSafetyCommand } from "./runSafetyCommand.js";

const port = Number(process.env.SAFETY_UI_PORT ?? 5188);

export function startDashboardServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      if (request.method === "GET" && url.pathname === "/") {
        return sendFile(
          response,
          path.join(dashboardPaths.dashboardDir, "index.html"),
          "text/html; charset=utf-8"
        );
      }

      if (request.method === "GET" && url.pathname.startsWith("/client/")) {
        return sendClientFile(response, url.pathname);
      }

      if (request.method === "GET" && url.pathname === "/api/latest") {
        return sendJson(response, readLatestSuggestion(dashboardPaths.rootDir));
      }

      if (request.method === "POST" && url.pathname === "/api/check") {
        return sendJson(response, await runSafetyCommand("check", dashboardPaths.rootDir));
      }

      if (request.method === "POST" && url.pathname === "/api/ai-suggest-fix") {
        return sendJson(
          response,
          await runSafetyCommand("ai:suggest-fix", dashboardPaths.rootDir)
        );
      }

      sendJson(response, { error: "Страница не найдена" }, 404);
    } catch (error) {
      sendJson(response, { error: error.message }, 500);
    }
  });

  server.listen(port, () => {
    console.log(`safety ui running at http://127.0.0.1:${port}`);
  });
}

function sendClientFile(response, pathname) {
  const fileName = pathname.replace("/client/", "");
  const filePath = path.join(dashboardPaths.clientDir, fileName);
  const contentType = fileName.endsWith(".css")
    ? "text/css; charset=utf-8"
    : "text/javascript; charset=utf-8";

  sendFile(response, filePath, contentType);
}
