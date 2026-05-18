export function mergeScopedSceneItems({ sourceItems, scopedSourceItems, scopedResultItems }) {
  const scopedSourceIds = new Set(scopedSourceItems.map((item) => String(item.id)));
  const resultById = new Map(scopedResultItems.map((item) => [String(item.id), item]));
  const merged = [];
  const sourceOrderIds = new Set(sourceItems.map((item) => String(item.id)));

  for (const item of sourceItems) {
    const id = String(item.id);

    if (!scopedSourceIds.has(id)) {
      merged.push(item);
      continue;
    }

    if (!resultById.has(id)) {
      continue;
    }

    merged.push(resultById.get(id));
    resultById.delete(id);
  }

  for (const item of scopedResultItems) {
    const id = String(item.id);

    if (sourceOrderIds.has(id)) {
      continue;
    }

    merged.push(item);
  }

  return merged;
}
