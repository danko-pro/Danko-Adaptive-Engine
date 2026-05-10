import { resolveCompositionPlan } from "../index.js";

const plan = resolveCompositionPlan({
  mode: "suggest",
  metrics: { columns: 30, rows: 20 },
  sourceMetrics: { columns: 30, rows: 20 },
  items: [
    { id: "header", x: 1, y: 1, w: 30, h: 2, meta: { value: "Header", blockType: "header" } },
    { id: "summary", x: 4, y: 5, w: 8, h: 4, meta: { value: "Summary", blockType: "content" } },
    { id: "actions", x: 22, y: 5, w: 6, h: 4, meta: { value: "Actions", blockType: "control" } }
  ],
  contentSchemas: {
    header: { type: "header", value: "Header" },
    summary: { type: "content", value: "Summary" },
    actions: { type: "control", value: "Actions" }
  },
  dependencies: {
    summary: ["actions"]
  }
});

console.log(JSON.stringify(plan, null, 2));
