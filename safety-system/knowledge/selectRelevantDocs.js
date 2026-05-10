import { docsManifest } from "./docsManifest.js";

const maxDocs = 4;

export function selectRelevantDocs({ checkOutput = "" } = {}) {
  const normalizedOutput = checkOutput.toLowerCase();
  const selected = [];
  const matching = [];

  for (const doc of docsManifest) {
    if (doc.always) {
      selected.push(doc);
      continue;
    }

    if (hasMatchingKeyword(normalizedOutput, doc.keywords)) {
      matching.push(doc);
    }
  }

  return [...selected, ...matching].slice(0, maxDocs);
}

function hasMatchingKeyword(text, keywords = []) {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}
