import fs from "node:fs";
import path from "node:path";
import { selectRelevantDocs } from "./selectRelevantDocs.js";

export function readKnowledgeContext({ rootDir, checkOutput }) {
  const docs = selectRelevantDocs({ checkOutput });
  const blocks = [];
  let totalLength = 0;

  for (const doc of docs) {
    const block = readKnowledgeFile(rootDir, doc);

    if (!block) {
      continue;
    }

    if (totalLength + block.length > 5200) {
      break;
    }

    blocks.push(block);
    totalLength += block.length;
  }

  return {
    docs,
    text: blocks.join("\n\n")
  };
}

function readKnowledgeFile(rootDir, doc) {
  const filePath = path.join(rootDir, doc.path);

  if (!fs.existsSync(filePath)) {
    return "";
  }

  return [
    `--- ${doc.path} ---`,
    truncateText(fs.readFileSync(filePath, "utf8"), doc.charLimit ?? 1500)
  ].join("\n");
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n\n[обрезано: ${text.length - maxLength} символов]`;
}
