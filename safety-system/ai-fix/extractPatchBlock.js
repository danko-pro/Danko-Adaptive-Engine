export function extractPatchBlock(text) {
  const start = text.indexOf("*** Begin Patch");
  const end = text.indexOf("*** End Patch");

  if (start === -1 || end === -1 || end < start) {
    return "";
  }

  return text.slice(start, end + "*** End Patch".length).trim();
}
